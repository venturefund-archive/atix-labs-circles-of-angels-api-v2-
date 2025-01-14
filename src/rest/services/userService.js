/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('hardhat');
const bcrypt = require('bcrypt');
const config = require('config');
const crypto = require('crypto');

const { key } = config.crypto;
const { support } = config;

const { userRoles, encryption } = require('../util/constants');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const checkExistence = require('./helpers/checkExistence');

const logger = require('../logger');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { encrypt } = require('../util/crypto');
const formatUserRolesByProject = require('./helpers/formatUserRolesByProject');
const groupRolesByProject = require('../services/helpers/groupRolesByProject');
const { addHours } = require('../util/date');

module.exports = {
  async getUserById(id) {
    logger.info('[UserService] :: Entering getUserById method');
    const user = await checkExistence(this.userDao, id, 'user');
    logger.info(`[UserService] :: User id ${user.id} found`);
    return user;
  },

  /**
   * Returns the user which the specified address belongs to
   * @param {String} address
   */
  async getUserByAddress(address) {
    logger.info('[UserService] :: Entering getUserByAddress method');
    const user = await this.userWalletDao.findByAddress(address);
    if (user) {
      logger.info('[UserService] :: User found');
      return user;
    }
    logger.error(`[UserService] :: User with address ${address} not found`);
    throw new COAError(errors.common.CantFindModelWithAddress('user', address));
  },

  /**
   * Returns the user which the specified address belongs to
   * @param {[String]} addresses
   */
  async getVotersByAddresses(addresses) {
    logger.info('[UserService] :: Entering getUserByAddress method');
    const users = await this.userWalletDao.findByAddresses(addresses);
    return users
      ? users.map(
          ({ firstName, lastName }) => firstName.charAt(0) + lastName.charAt(0)
        )
      : [];
  },

  /**
   * Receives the user's email and password and tries to authenticate
   *
   * @param {string} email user's email
   * @param {string} pwd user's password
   * @returns user information | error message
   */
  async login(email, pwd) {
    logger.info(`[User Service] :: Trying to login ${email} user`);
    const user = await this.userDao.getUserByEmail(email.toLowerCase());

    if (!user) {
      logger.error('[User Service] :: User was not found');
      throw new COAError(errors.user.InvalidUserOrPassword);
    }

    logger.info(`[User Service] :: User email ${email} found`);
    const match = await bcrypt.compare(pwd, user.password);

    if (!match) {
      logger.error(
        '[User Service] :: Login failed. Incorrect user or password'
      );
      throw new COAError(errors.user.InvalidUserOrPassword);
    }
    logger.info('[User Service] :: User has matched user and password');
    const {
      firstName,
      lastName,
      id,
      role,
      forcePasswordChange,
      isAdmin,
      pin,
      first
    } = user;

    //logger.info('[User Service] :: Trying to see if user belongs to a Dao');
    // user.wallet = await this.getUserWallet(user.id);
    // const userDaos = await this.daoService.getDaos({ user });
    // const hasDaos = userDaos.length > 0;
    // logger.info(`[User Service] :: User belongs to any DAO? ${hasDaos}`);
    // let projects;
    // try {
    //   projects = !isAdmin
    //     ? (await this.userProjectDao.getProjectsOfUser(id)).map(
    //         ({ project }) => project.id
    //       )
    //     : [];
    // } catch (error) {
    //   logger.error(
    //     '[User Service] There was an error getting projects for user with id ',
    //     user.id
    //   );
    //   throw new COAError(errors.common.InternalServerError);
    // }

    const userPopulatedProjects = await this.userProjectService.getUserPopulatedProjects(
      user.id
    );

    const userGenesisProjects = userPopulatedProjects
      .filter(({ project }) => project.parent === null)
      .map(({ project, ...rest }) => ({ project: project.id, ...rest }));

    const rolesGroupedByProject = groupRolesByProject(userGenesisProjects);

    const projects = await Promise.all(
      rolesGroupedByProject.map(async projectRoles => {
        const lastProjectReview = await this.projectDao.getLastValidReview(
          projectRoles.projectId
        );
        return {
          ...projectRoles,
          ...lastProjectReview
        };
      })
    );

    const authenticatedUser = {
      firstName,
      lastName,
      email: user.email,
      id,
      isAdmin,
      role,
      hasDaos: false,
      forcePasswordChange,
      projects,
      pin,
      first
    };

    if (forcePasswordChange) {
      logger.info(
        `[User Service] :: User ID ${
          user.id
        } should be forced to change its password`
      );
    }

    if (user.blocked) {
      logger.error(`[User Service] :: User ID ${user.id} is blocked`);
      throw new COAError(errors.user.UserRejected);
    }

    if (!user.emailConfirmation) {
      logger.error(
        `[User Service] :: User ID ${user.id} needs confirm email address `
      );
      throw new COAError(errors.user.NotConfirmedEmail);
    }

    return authenticatedUser;
  },

  /**
   * Receives the user's API key and secret and tries to authenticate
   *
   * @param {string} apiKey user's API key
   * @param {string} apiSecret user's API secret
   * @returns user information | error message
   */
  async loginAPI(apiKey, apiSecret) {
    logger.info(`[User Service] :: Trying to login user via apiKey ${apiKey}`);
    const user = await this.userDao.getUserByAPIKey(apiKey.toLowerCase());

    if (!user) {
      logger.error('[User Service] :: User was not found');
      throw new COAError(errors.user.InvalidAPIKeyOrSecret);
    }

    logger.info(`[User Service] :: User email ${user.email} found`);
    const match = await bcrypt.compare(apiSecret, user.apiSecret);

    if (!match) {
      logger.error(
        '[User Service] :: Login failed. Incorrect API key or secret'
      );
      throw new COAError(errors.user.InvalidAPIKeyOrSecret);
    }
    logger.info('[User Service] :: User has matched API key and secret');
    const {
      firstName,
      lastName,
      id,
      role,
      forcePasswordChange,
      isAdmin,
      roles,
      pin,
      first
    } = user;

    logger.info('[User Service] :: Trying to see if user belongs to a Dao');
    let projects;
    try {
      projects = !isAdmin
        ? (await this.userProjectDao.getProjectsOfUser(id)).map(
            ({ project }) => project.id
          )
        : [];
    } catch (error) {
      logger.error(
        '[User Service] There was an error getting projects for user with id ',
        user.id
      );
      throw new COAError(errors.common.InternalServerError);
    }
    const authenticatedUser = {
      firstName,
      lastName,
      email: user.email,
      id,
      isAdmin,
      role,
      hasDaos: false,
      forcePasswordChange,
      projects: groupRolesByProject(roles),
      pin,
      first
    };

    return authenticatedUser;
  },

  /**
   * Upserts user's API key and secret.
   *
   * @param {string} id user's id
   * @param {string} apiKey user's API key
   * @param {string} apiSecret user's API secret
   * @returns {boolean} result of the operation
   */
  async updateApiKeyAndSecret(id, apiKey, apiSecret) {
    logger.info(
      `[User Service] :: Trying to update apiKey and apiSecret for user ${id}`
    );
    const updatedUser = await this.userDao.updateUser(id, {
      apiKey,
      apiSecret
    });
    return !!updatedUser;
  },

  /**
   * Creates a new user
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {number} role id
   * @param {object} detail additional user information
   * @param {object} questionnaire on boarding Q&A
   * @returns new user | error
   */
  async createUser(
    {
      firstName,
      lastName,
      email,
      password,
      role,
      phoneNumber = null,
      country,
      company,
      answers,
      address,
      encryptedWallet,
      mnemonic
    },
    adminRole
  ) {
    logger.info(`[User Routes] :: Creating new user with email ${email}`);
    validateRequiredParams({
      method: 'createUser',
      params: {
        firstName,
        lastName,
        email,
        password,
        role,
        country,
        answers,
        address,
        encryptedWallet,
        mnemonic
      }
    });
    this.validatePassword(password);

    if (role === userRoles.COA_ADMIN && !adminRole) {
      logger.error(
        '[User Service] :: It is not allowed to create users with admin role.'
      );
      throw new COAError(errors.user.NotAllowSignUpAdminUser);
    }

    const existingUser = await this.userDao.getUserByEmail(email);

    if (existingUser) {
      logger.error(
        `[User Service] :: User with email ${email} already exists.`
      );
      throw new COAError(errors.user.EmailAlreadyInUse);
    }
    await this.countryService.getCountryById(country);
    // TODO: check phoneNumber format
    const hashedPwd = await bcrypt.hash(password, encryption.saltOrRounds);
    const user = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPwd,
      role,
      phoneNumber,
      country,
      answers,
      company
    };
    const encryptedMnemonic = await encrypt(mnemonic, key);
    if (
      !encryptedMnemonic ||
      !encryptedMnemonic.encryptedData ||
      !encryptedMnemonic.iv
    ) {
      logger.error('[User Service] :: Mnemonic could not be encrypted');
      throw new COAError(errors.user.MnemonicNotEncrypted);
    }
    const savedUser = await this.userDao.createUser(user);
    const savedUserWallet = await this.userWalletDao.createUserWallet(
      {
        user: savedUser.id,
        address,
        encryptedWallet,
        mnemonic: encryptedMnemonic.encryptedData,
        iv: encryptedMnemonic.iv
      },
      true
    );
    if (!savedUserWallet) {
      await this.userDao.removeUserById(savedUser.id);
      throw new COAError(errors.userWallet.NewWalletNotSaved);
    }

    try {
      // TODO: Uncomment after it's implemented GSN
      /* const accounts = await ethers.getSigners();
      const tx = {
        to: address,
        value: utils.parseEther('0.001')
      };
      await accounts[0].sendTransaction(tx); */

      const profile = `${firstName} ${lastName}`;
      // using migrateMember instead of createMember for now
      await coa.migrateMember(profile, address);

      // whitelist user
      const whitelistContract = await coa.getWhitelist();
      await whitelistContract.addUser(savedUserWallet.address);

      logger.info(`[User Service] :: New user created with id ${savedUser.id}`);
    } catch (error) {
      await this.userWalletDao.removeUserWalletByUser(savedUser.id);
      await this.userDao.removeUserById(savedUser.id);
      logger.error(
        `[UserService] :: Error to create user with email ${email}: `,
        error
      );
      if (error.statusCode) {
        throw error;
      }
      throw new COAError({ message: error.message, statusCode: 500 });
    }
    try {
      await this.mailService.sendEmailVerification({
        to: email,
        bodyContent: {
          userName: firstName,
          userId: savedUser.id
        },
        userId: savedUser.id
      });
    } catch (error) {
      logger.error('[UserService] :: Error to send verification email', error);
    }
    return { address, encryptedWallet, mnemonic, ...savedUser };
  },
  // TODO: delete createUser and replace by this method
  /**
   * Creates a new user
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {object} detail additional user information
   * @returns new user | error
   */
  async newCreateUser({ firstName, lastName, email, isAdmin, country }) {
    logger.info(`[User Routes] :: Creating new user with email ${email}`);
    const method = 'newCreateUser';
    validateRequiredParams({
      method,
      params: {
        firstName,
        lastName,
        email,
        isAdmin,
        country
      }
    });

    const existingUser = await this.userDao.getUserByEmail(email);

    if (existingUser) {
      logger.error(
        `[User Service] :: User with email ${email} already exists.`
      );
      throw new COAError(errors.user.EmailAlreadyInUse);
    }
    const hashedPwd = await bcrypt.hash(
      crypto.randomBytes(32).toString('base64'),
      encryption.saltOrRounds
    );
    const user = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPwd,
      country,
      forcePasswordChange: true,
      isAdmin
    };
    const { id } = await this.userDao.createUser(user);
    return { id };
  },

  async validateUserEmail(userId) {
    const updatedUser = await this.userDao.updateUser(userId, {
      emailConfirmation: true
    });
    if (!updatedUser) {
      logger.error(
        '[UserService] :: Error updating emailValidation in database for user: ',
        userId
      );
      throw new COAError(errors.user.UserUpdateError);
    }

    return true;
  },

  /**
   * Returns a list of all non-admin users with their details
   *
   * @returns user list
   */
  async getUsers() {
    logger.info('[User Service] :: Getting all Users');
    const users = await this.userDao.getUsers();
    return users.map(formatUserRolesByProject);
  },

  /**
   * Returns an array of projects associated with the specified user.
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getProjectsOfUser(userId) {
    logger.info('[UserService] :: Entering getProjectsOfUser method');
    validateRequiredParams({
      method: 'getProjectsOfUser',
      params: { userId }
    });
    const user = await checkExistence(this.userDao, userId, 'user');
    if (user.role === userRoles.ENTREPRENEUR) {
      const projects = await this.projectService.getProjectsByOwner(userId);
      return projects;
    }

    if (user.role === userRoles.PROJECT_SUPPORTER) {
      // TODO: Do this when the relation between supporter and project exists
      const projects = [];
      return projects;
    }

    return [];
  },

  /**
   * Returns an array of followed projects for an specific user.
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getFollowedProjects({ userId }) {
    logger.info('[UserService] :: Entering getFollowedProjects method');
    validateRequiredParams({
      method: 'getFollowedProjects',
      params: { userId }
    });

    const user = await this.userDao.getFollowedProjects(userId);

    if (!user) {
      logger.error(`[User Service] :: User ID ${userId} does not exist`);
      throw new COAError(errors.user.UserNotFound);
    }

    const { following } = user;
    return following || [];
  },

  /**
   * Returns an array of projects where the user applied as candidate
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getAppliedProjects({ userId }) {
    logger.info('[UserService] :: Entering getAppliedProjects method');
    validateRequiredParams({
      method: 'getAppliedProjects',
      params: { userId }
    });

    const user = await this.userDao.getAppliedProjects(userId);

    if (!user) {
      logger.error(`[User Service] :: User ID ${userId} does not exist`);
      throw new COAError(errors.user.UserNotFound);
    }

    return {
      funding: user.funding,
      monitoring: user.monitoring
    };
  },

  validatePassword(password) {
    if (!RegExp('^(?=.{8,})').test(password)) {
      logger.error(
        `[User Service] :: Password ${password} must have at least 8 characters`
      );
      throw new COAError(errors.user.minimunCharacterPassword);
    }
    if (!RegExp('^(?=.*[a-z])').test(password)) {
      logger.error(
        `[User Service] :: Password ${password} must have at least 1 lowercase character`
      );
      throw new COAError(errors.user.lowerCaseCharacterPassword);
    }
    if (!RegExp('^(?=.*[A-Z])').test(password)) {
      logger.error(
        `[User Service] :: Password ${password} must have at least 1 uppercase character`
      );
      throw new COAError(errors.user.upperCaseCharacterPassword);
    }

    if (!RegExp('^(?=.*[0-9])').test(password)) {
      logger.error(
        `[User Service] :: Password ${password} must have at least 1 numeric character`
      );
      throw new COAError(errors.user.numericCharacterPassword);
    }
  },

  async validUser(user, isAdmin) {
    const existentUser = await this.getUserById(user.id);
    if (isAdmin !== undefined) {
      return existentUser && isAdmin === existentUser.isAdmin;
    }
    return !!existentUser;
  },

  async getUserWallet(userId) {
    logger.info('[UserService] :: Entering getUserWallet method');
    const wallet = await this.userWalletDao.findActiveByUserId(userId);
    if (!wallet) return {};
    // const wallet = new Wallet(privKey, ethers.provider);
    return wallet;
  },

  async updatePassword(
    id,
    currentPassword,
    newPassword,
    encryptedWallet,
    address,
    mnemonic
  ) {
    logger.info('[UserService] :: Entering updatePassword method');
    const user = await this.userDao.findById(id);
    if (!user) {
      logger.info(
        '[UserService] :: There is no user associated with that email',
        id
      );
      return false;
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      logger.error(
        '[User Service] :: Update password failed. Current password is incorrect'
      );
      throw new COAError(errors.user.InvalidPassword);
    }
    const hashedPwd = await bcrypt.hash(newPassword, encryption.saltOrRounds);
    const updated = await this.userDao.updateUser(id, {
      password: hashedPwd,
      forcePasswordChange: false
    });
    if (!updated) {
      logger.error(
        '[UserService] :: Error updating password in database for user: ',
        id
      );
      throw new COAError(errors.user.UserUpdateError);
    }
    if (!mnemonic && !address) {
      const updatedWallet = await this.userWalletDao.updateWallet(
        { user: id, active: true },
        { encryptedWallet }
      );
      if (!updatedWallet) {
        throw new COAError(errors.userWallet.WalletNotUpdated);
      }
    } else {
      const disabledWallet = await this.userWalletDao.updateWallet(
        { user: id, active: true },
        { active: false }
      );
      const encryptedMnemonic = await encrypt(mnemonic, key);
      const savedUserWallet = await this.userWalletDao.createUserWallet(
        {
          user: id,
          encryptedWallet,
          address,
          mnemonic: encryptedMnemonic.encryptedData,
          iv: encryptedMnemonic.iv
        },
        true
      );
      if (!savedUserWallet) {
        if (disabledWallet) {
          // Rollback
          await this.userWalletDao.updateWallet(
            { id: disabledWallet.id },
            { active: true }
          );
        }
        throw new COAError(errors.userWallet.NewWalletNotSaved);
      }
      return updated;
    }
  },
  async getUserByEmail(email) {
    logger.info('[getUserByEmail] :: Entering getUserByEmail method');
    const user = await this.userDao.getUserByEmail(email);
    logger.info(
      `[getUserByEmail] :: Get user with email ${email} ${
        user ? '' : 'not'
      } found`
    );
    return user ? formatUserRolesByProject(user) : undefined;
  },
  async getUsersByProject(projectId) {
    logger.info('[getUsersByProject] :: Entering getUsersByProject method');
    const users = await this.userDao.getUsersByProject(projectId);
    logger.info(
      `[getUsersByProject] :: Get ${
        users.length
      } users in project with id ${projectId}`
    );
    return users.map(formatUserRolesByProject);
  },
  async sendWelcomeEmail(userId, projectId) {
    const user = await checkExistence(this.userDao, userId, 'user');
    if (projectId) {
      await this.projectService.getProjectById(projectId);
      const userProject = await this.userProjectDao.getUserProject({
        user: userId,
        project: projectId
      });
      if (userProject.length === 0) {
        logger.error(
          `[User Service] User with id ${userId} is not related to project with id ${projectId}`
        );
        throw new COAError(errors.user.UserNotRelatedToTheProject);
      }
    }
    const { email } = user;
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
      throw new COAError(errors.user.TokenNotCreated);
    }
    try {
      await this.mailService.sendInitialUserResetPassword({
        to: email,
        bodyContent: {
          email,
          token,
          projectId
        }
      });
      const toReturn = { success: !!recovery };
      return toReturn;
    } catch (error) {
      logger.error('[UserService] :: Error sending verification email', error);
      throw new COAError(errors.mail.EmailNotSent);
    }
  },
  async setPin(id) {
    logger.info(
      `[UserService] :: About to set pin to true for user with id ${id}`
    );
    await checkExistence(this.userDao, id, 'user');
    const updated = await this.userDao.updateUser(id, { pin: true });
    if (!updated) {
      logger.error('[UserService] There was an error updating user pin');
      throw new COAError(errors.user.UserUpdateError);
    }
    logger.info('[UserService] User pin successfully updated');
    const toReturn = { success: !!updated };
    return toReturn;
  },
  async createWallet(id, { wallet, address, mnemonic, iv }) {
    logger.info(
      `[UserService] :: About to update user with id ${id} with wallet ${wallet}, address ${address}, iv ${iv} and mnemonic ${mnemonic}`
    );
    const walletFound = await this.userWalletDao.findActiveByUserId(id);
    if (walletFound) {
      logger.info('[UserService] :: Wallet found for user with id ', id);
      const toReturn = { id: walletFound.id };
      return toReturn;
    }
    logger.info('[UserService] User wallet was not found, creating one');
    const savedUserWallet = await this.userWalletDao.createUserWallet(
      {
        user: id,
        encryptedWallet: wallet,
        address,
        mnemonic,
        iv
      },
      true
    );
    if (!savedUserWallet) {
      logger.error('[UserService] There was an error creating user wallet');
      throw new COAError(errors.userWallet.NewWalletNotSaved);
    }

    logger.info(`[UserService] Update user address ${address}`);
    const updatedUser = await this.userDao.updateUser(id, {
      address
    });

    if (!updatedUser) {
      logger.error('[UserService] There was an error updating user address');
      throw new COAError(errors.user.UserUpdateError);
    }
    const toReturn = { id: savedUserWallet.id };
    return toReturn;
  }
};
