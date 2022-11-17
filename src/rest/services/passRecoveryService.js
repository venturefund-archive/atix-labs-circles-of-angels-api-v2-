/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { isEmpty } = require('lodash');
const { support } = require('config');
const config = require('config');

const { key } = config.crypto;
const checkExistence = require('./helpers/checkExistence');

const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const { encrypt, decrypt } = require('../util/crypto');
const { addHours } = require('../util/date');

module.exports = {
  async startPassRecoveryProcess(email, projectId) {
    logger.info(
      '[Pass Recovery Service] :: Starting pass recovery for email:',
      email
    );
    const user = await this.userDao.getUserByEmail(email);
    if (!user) {
      logger.info(
        '[PassRecovery Service] :: There is no user associated with that email',
        email
      );
      throw new COAError(errors.user.EmailNotExists(email));
    }
    const { id } = user;
    if (projectId) {
      await checkExistence(this.projectDao, projectId, 'project');
      const userProject = await this.userProjectDao.findUserProject({
        user: user.id,
        project: projectId
      });
      if (!userProject) {
        logger.error(
          `[PassRecovery Service] User with id ${id} is not related to project with id ${projectId}`
        );
        throw new COAError(errors.user.UserNotRelatedToTheProject);
      }
    }
    const hash = await crypto.randomBytes(25);
    const token = hash.toString('hex');
    const expirationDate = addHours(support.recoveryTime, new Date());
    const recovery = await this.passRecoveryDao.createRecovery(
      email,
      token,
      expirationDate
    );

    if (!recovery) {
      logger.info(
        '[PassRecovery Service]:: Can not create recovery with email',
        email
      );
      return email;
    }

    const info = await this.mailService.sendEmailRecoveryPassword({
      to: email,
      bodyContent: {
        token,
        projectId
      }
    });

    if (!info || !isEmpty(info.rejected)) {
      logger.info('[PassRecovery Service] :: Invalid email', email);
    }

    return email;
  },

  async getMnemonicFromToken(token) {
    try {
      const recover = await this.passRecoveryDao.findRecoverBytoken(token);
      if (!recover) {
        logger.error('[Pass Recovery Service] :: Token not found: ', token);
        throw new COAError(errors.user.InvalidToken);
      }

      if (new Date() > new Date(recover.expirationDate)) {
        logger.error('[Pass Recovery Service] :: Token has expired: ', token);
        await this.passRecoveryDao.deleteRecoverByToken(token);
        throw new COAError(errors.user.ExpiredToken);
      }

      const { email } = recover;
      const { mnemonic, iv } = await this.userDao.getUserByEmail(email);
      // TODO: uncomment this validation when it's already migrated all users
      /* if (!mnemonic) {
        logger.error(
          '[Pass Recovery Service] :: Mnemonic not found of user with email: ',
          email
        );
        throw new COAError(errors.user.InvalidEmail);
      } */
      // TODO: remove this validation when it's already migrated all users
      if (!iv) {
        return mnemonic;
      }
      const decryptedMnemonic = decrypt(mnemonic, key, iv);
      if (!decryptedMnemonic) {
        logger.error(
          '[Pass Recovery Service] :: Mnemonic could not be decrypted',
          mnemonic,
          iv
        );
        throw new COAError(errors.user.MnemonicNotDecrypted);
      }
      return decryptedMnemonic;
    } catch (error) {
      logger.error('[Pass Recovery Service] :: Error get mnemonic password');
      throw Error('Error get mnemonic password');
    }
  },

  async updatePassword({ token, password }) {
    try {
      const recovery = await this.passRecoveryDao.findRecoverBytoken(token);
      if (!recovery || !recovery.email) {
        logger.error('[Pass Recovery Service] :: Token not found: ', token);
        throw new COAError(errors.user.InvalidToken);
      }
      const { email } = recovery;
      const user = await this.userDao.getUserByEmail(email);
      if (!user) {
        logger.error(
          '[Pass Recovery Service] :: There is no user associated with that email',
          email
        );
        throw new COAError(errors.user.InvalidEmail);
      }
      // const { id, address, encryptedWallet, first } = user;
      // Only for old users with no mnemonic
      // TODO: remove this validation when it's already migrated all users
      // if (address && address !== newAddress) {
      //   await this.userWalletDao.createUserWallet(
      //     {
      //       user: id,
      //       encryptedWallet,
      //       address
      //     },
      //     false
      //   );
      // }

      const hashedPwd = await bcrypt.hash(password, 10);
      const changeFields = {
        password: hashedPwd,
        forcePasswordChange: false,
        emailConfirmation: true
      };
      if (user.first) changeFields.first = false;
      const updated = await this.userDao.updateUserByEmail(email, changeFields);
      // const disabledWallet = await this.userWalletDao.updateWallet(
      //   { user: id, active: true },
      //   { active: false }
      // );
      // const newEncryptedMnemonic = await encrypt(newMnemonic, key);
      // if (
      //   !newEncryptedMnemonic ||
      //   !newEncryptedMnemonic.encryptedData ||
      //   !newEncryptedMnemonic.iv
      // ) {
      //   logger.error('[User Service] :: Mnemonic could not be encrypted');
      //   throw new COAError(errors.user.MnemonicNotEncrypted);
      // }
      // const savedUserWallet = await this.userWalletDao.createUserWallet(
      //   {
      //     user: id,
      //     encryptedWallet: newEncryptedWallet,
      //     address: newAddress,
      //     mnemonic: newEncryptedMnemonic.encryptedData,
      //     iv: newEncryptedMnemonic.iv
      //   },
      //   true
      // );
      // if (!savedUserWallet) {
      //   if (disabledWallet) {
      //     // Rollback
      //     await this.userWalletDao.updateWallet(
      //       { id: disabledWallet.id },
      //       { active: true }
      //     );
      //   }
      //   throw new COAError(errors.userWallet.NewWalletNotSaved);
      // }
      if (!updated) {
        logger.error(
          '[Pass Recovery Service] :: Error updating password in database for user: ',
          email
        );
        throw new COAError(errors.user.UserUpdateError);
      }

      await this.passRecoveryDao.deleteRecoverByToken(token);
      return updated;
    } catch (error) {
      if (error instanceof COAError) throw error;
      logger.error('[Pass Recovery Service] :: Error updating password');
      throw Error('Error updating password');
    }
  }
};
