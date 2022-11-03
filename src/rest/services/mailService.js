/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty } = require('lodash');
const config = require('config');
const path = require('path');
const fs = require('fs');
const validateRequiredParams = require('../services/helpers/validateRequiredParams');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const templateParser = require('../services/helpers/templateParser');
const { templateNames } = require('../services/helpers/templateLoader');
const logger = require('../logger');

const image = fs
  .readFileSync(path.join(__dirname, '../../../assets/public/logoemail.png'))
  .toString('base64');
const sendGridAttachments = [
  {
    filename: 'logoemail.png',
    type: 'image/png',
    content: image,
    content_id: 'imageLogo',
    disposition: 'inline'
  }
];
const nodeMailerAttachments = [
  {
    filename: 'logoemail.png',
    path: path.join(__dirname, '../../../assets/public/logoemail.png'),
    cid: 'imageLogo'
  }
];

module.exports = {
  /**
   * Sends an email.
   *
   * @param {string} to - email's recipient.
   * @param {string} from - email's sender.
   * @param {string} subject - email's subject.
   * @param {number} text <= TODO : what is this?
   * @param {object} html - email's html content.
   * @returns
   */
  async sendMail({ to, from = config.email.from, subject, text, html }) {
    let attachments;
    logger.info(`[MailService] :: Sending email to: ${to} subject: ${subject}`);
    validateRequiredParams({
      method: 'sendMail',
      params: { to, from, subject, html }
    });

    if (this.emailClient.isNodeMailer()) {
      attachments = nodeMailerAttachments;
    } else {
      attachments = sendGridAttachments;
    }
    try {
      const info = await this.emailClient.sendMail({
        to,
        from,
        subject,
        text,
        html,
        attachments
      });
      // why isEmpty?
      if (!isEmpty(info.rejected)) {
        throw new Error('Invalid email account');
      }
      return info;
    } catch (error) {
      logger.error('[MailService] :: Email was not sent', error);
      throw new COAError(errors.mail.EmailNotSent);
    }
  },

  async sendSignUpMail({
    to,
    subject = 'Welcome to Circles of Angels',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending sign up mail to:', to);
    validateRequiredParams({
      method: 'sendSignUpMail',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.SIGNUP
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendProjectStatusChangeMail({
    to,
    subject = 'Circles of Angels: A project has been updated',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending project status change mail to:', to);
    validateRequiredParams({
      method: 'sendProjectStatusChangeMail',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.PROJECT_STATUS_CHANGE
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendEmailVerification({
    to,
    subject = 'Circles of Angels: Account verification',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending verification mail to:', to);
    validateRequiredParams({
      method: 'sendEmailVerification',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.EMAIL_CONFIRMATION
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendEmailRecoveryPassword({
    to,
    subject = 'Circles of Angels: Recovery Password',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending recovery password mail to:', to);
    validateRequiredParams({
      method: 'sendEmailRecoveryPassword',
      params: { to, subject, bodyContent }
    });
    const baseUrl = bodyContent.projectId
      ? `${config.frontendUrl}/${bodyContent.projectId}`
      : `${config.frontendUrl}/u`;
    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: baseUrl
      },
      templateNames.RECOVERY_PASSWORD
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendEmailInitialRecoveryPassword({
    to,
    subject = 'Circles of Angels: Reset Password',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending recovery password mail to:', to);
    validateRequiredParams({
      method: 'sendEmailRecoveryPassword',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.WELCOME
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendLowBalanceGSNAccountEmail(to, account, balance) {
    logger.info(
      `[MailService] :: Sending low balance in Main account ${account} to ${to}`
    );
    validateRequiredParams({
      method: 'sendLowBalanceGSNAccountEmail',
      params: { to, account, balance }
    });

    const html = await templateParser.completeTemplate(
      {
        title: 'Alert COA main account is running out of balance.',
        bodyText: `This is a reminder that the COA Gas station is running out of money, having currently ${balance} WEIs left. 
Please add more to avoid transactions not being able to execute. 
Remember the address to transfer the money to is: ${account}`
      },
      templateNames.ALERT
    );
    const subject = 'COA Gas Station Balance Alert';
    await this.sendMail({ to, subject, html });
  },

  async sendInitialUserResetPassword({
    to,
    subject = 'Circles of Angels: Reset Password',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending recovery password mail to:', to);
    validateRequiredParams({
      method: 'sendInitialUserResetPassword',
      params: { to, subject, bodyContent }
    });
    const baseUrl = bodyContent.projectId
      ? `${config.frontendUrl}/${bodyContent.projectId}`
      : `${config.frontendUrl}/u`;

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: baseUrl
      },
      templateNames.WELCOME
    );
    await this.sendMail({ to, subject, text, html });
  }
};
