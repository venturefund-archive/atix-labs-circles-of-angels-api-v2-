/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty } = require('lodash');
const config = require('config');
const fs = require('fs');
const mjml2html = require('mjml');
const validateRequiredParams = require('../services/helpers/validateRequiredParams');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const templateParser = require('../services/helpers/templateParser');
const { templateNames } = require('../services/helpers/templateLoader');
const logger = require('../logger');
const languages = require('../../../projects/languages/default.json');
const { ACTION_TYPE } = require('../util/constants');
const emailClient = require('../services/helpers/emailClient');
const projectService = require('../services/projectService');

const FRONTEND_URL = config.frontendUrl;
const IMAGES_URL = `${FRONTEND_URL}/static/images`;
const URL_LOGO = `${IMAGES_URL}/logo-email.png`;
const URL_LOCKED_WINDOW = `${IMAGES_URL}/locked-window.png`;
const URL_UPLOAD_TO_CLOUD = `${IMAGES_URL}/upload-to-cloud.png`;
const TEMPLATES_DIRECTORY_PATH = `${process.cwd()}/assets/templates/email`;

const getHTMLFromMJML = ({ mjmlFileName, objectData }) => {
  const mjmlFileContent = fs.readFileSync(
    `${TEMPLATES_DIRECTORY_PATH}/${mjmlFileName}.mjml`
  );
  let htmlOutput = mjml2html(mjmlFileContent.toString()).html;
  Object.keys(objectData).forEach(key => {
    const regExp = new RegExp(`{{${key}}}`, 'g');
    htmlOutput = htmlOutput.replace(regExp, objectData[key]);
  });
  return htmlOutput;
};

const sendMail = async ({
  to,
  from = config.email.from,
  subject,
  text,
  html
}) => {
  logger.info(`[MailService] :: Sending email to: ${to} subject: ${subject}`);
  validateRequiredParams({
    method: 'sendMail',
    params: { to, from, subject, html }
  });
  try {
    const info = await emailClient.sendMail({
      to,
      from,
      subject,
      text,
      html
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
};

const sendSignUpMail = async ({
  to,
  subject = 'Welcome to Circles of Angels',
  text,
  bodyContent
}) => {
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
  await sendMail({ to, subject, text, html });
};

const sendProjectStatusChangeMail = async ({
  to,
  subject = 'Circles of Angels: A project has been updated',
  text,
  bodyContent
}) => {
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
  await sendMail({ to, subject, text, html });
};

const sendEmailVerification = async ({
  to,
  subject = 'Circles of Angels: Account verification',
  text,
  bodyContent
}) => {
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
  await sendMail({ to, subject, text, html });
};

const sendEmailRecoveryPassword = async ({
  to,
  subject = 'Circles of Angels: Recovery Password',
  text,
  bodyContent
}) => {
  logger.info('[MailService] :: Sending recovery password mail to:', to);
  validateRequiredParams({
    method: 'sendEmailRecoveryPassword',
    params: { to, subject, bodyContent }
  });
  const baseUrl = bodyContent.projectId
    ? `${FRONTEND_URL}/${bodyContent.projectId}`
    : `${FRONTEND_URL}/u`;
  const html = getHTMLFromMJML({
    mjmlFileName: templateNames.RECOVERY_PASSWORD,
    objectData: {
      ...bodyContent,
      ...languages.resetPasswordEmail,
      frontendUrl: baseUrl,
      URL_LOGO,
      URL_LOCKED_WINDOW
    }
  });
  await sendMail({ to, subject, text, html });
};

const sendEmailInitialRecoveryPassword = async ({
  to,
  subject = 'Circles of Angels: Reset Password',
  text,
  bodyContent
}) => {
  logger.info('[MailService] :: Sending recovery password mail to:', to);
  validateRequiredParams({
    method: 'sendEmailRecoveryPassword',
    params: { to, subject, bodyContent }
  });

  const html = getHTMLFromMJML({
    mjmlFileName: templateNames.WELCOME,
    objectData: {
      ...bodyContent,
      frontendUrl: FRONTEND_URL,
      URL_LOGO,
      URL_LOCKED_WINDOW,
      ...languages.welcomeEmail
    }
  });
  await sendMail({ to, subject, text, html });
};

const sendLowBalanceGSNAccountEmail = async (to, account, balance) => {
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
  await sendMail({ to, subject, html });
};

const sendInitialUserResetPassword = async ({
  to,
  subject = 'Circles of Angels: Reset Password',
  text,
  bodyContent
}) => {
  logger.info('[MailService] :: Sending recovery password mail to:', to);
  validateRequiredParams({
    method: 'sendInitialUserResetPassword',
    params: { to, subject, bodyContent }
  });
  const baseUrl = bodyContent.projectId
    ? `${FRONTEND_URL}/${bodyContent.projectId}`
    : `${FRONTEND_URL}/u`;

  const html = getHTMLFromMJML({
    mjmlFileName: templateNames.WELCOME_USER,
    objectData: {
      ...bodyContent,
      ...languages.welcomeUserEmail,
      frontendUrl: baseUrl,
      URL_LOGO,
      URL_LOCKED_WINDOW
    }
  });
  await sendMail({ to, subject, text, html });
};

const sendPublishProject = async ({
  to,
  subject = 'Circles of Angels: Project published',
  text,
  bodyContent
}) => {
  validateRequiredParams({
    method: 'sendPublishProject',
    params: { to, subject, bodyContent }
  });
  const html = getHTMLFromMJML({
    mjmlFileName: templateNames.PUBLISH_PROJECT,
    objectData: {
      ...bodyContent,
      ...languages.publishedProjectEmail,
      frontendUrl: FRONTEND_URL,
      URL_LOGO,
      URL_UPLOAD_TO_CLOUD
    }
  });
  await sendMail({ to, subject, text, html });
};

const sendEmailCloneInReview = async ({
  to,
  subject = 'Circles of Angels: Project review have been requested',
  text,
  bodyContent
}) => {
  validateRequiredParams({
    method: 'sendEmailProjectInReview',
    params: { to, subject, bodyContent }
  });
  const html = getHTMLFromMJML({
    mjmlFileName: templateNames.CLONE_IN_REVIEW,
    objectData: {
      ...bodyContent,
      ...languages.cloneInReviewEmail,
      frontendUrl: FRONTEND_URL,
      URL_LOGO,
      URL_UPLOAD_TO_CLOUD
    }
  });
  await sendMail({ to, subject, text, html });
};

const SEND_EMAIL_BY_ACTION = {
  [ACTION_TYPE.PUBLISH_PROJECT]: sendPublishProject,
  [ACTION_TYPE.SEND_PROJECT_TO_REVIEW]: sendEmailCloneInReview
};

const sendEmails = async ({ project, action, users }) => {
  try {
    logger.info('[ProjectService] :: About to send project action emails');
    const sendEmail = SEND_EMAIL_BY_ACTION[action];
    const usersToSendEmail =
      users ||
      (await projectService.getUsersByProjectId({
        projectId: project.id
      }));
    const { projectName, id } = project;
    const bodyContent = {
      projectName,
      projectId: id
    };
    await Promise.all(
      usersToSendEmail.map(({ email }) =>
        sendEmail({
          to: email,
          bodyContent
        })
      )
    );
  } catch (error) {
    logger.error(
      '[ProjectService] :: There was an error trying to send project action emails',
      error
    );
    throw new COAError(errors.mail.EmailNotSent);
  }
};

module.exports = {
  sendMail,

  sendSignUpMail,

  sendProjectStatusChangeMail,

  sendEmailVerification,

  sendEmailRecoveryPassword,

  sendEmailInitialRecoveryPassword,

  sendLowBalanceGSNAccountEmail,

  sendInitialUserResetPassword,

  sendPublishProject,

  sendEmailCloneInReview,

  sendEmails
};
