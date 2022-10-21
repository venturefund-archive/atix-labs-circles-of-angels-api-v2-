const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const COAError = require('../../errors/COAError');
const errors = require('../../errors/exporter/ErrorExporter');
const logger = require('../../logger');

const readFile = promisify(fs.readFile);

const templateNames = {
  GENERIC: 'generic',
  SIGNUP: 'signup',
  PROJECT_STATUS_CHANGE: 'projectStatusChange',
  EMAIL_CONFIRMATION: 'confirmEmail',
  RECOVERY_PASSWORD: 'recoveryPassword',
  WELCOME: 'welcome',
  ALERT: 'alert'
};

const templatePaths = {
  [templateNames.GENERIC]: '../../../../assets/templates/email/generic.html',
  [templateNames.SIGNUP]: '../../../../assets/templates/email/signup.html',
  [templateNames.PROJECT_STATUS_CHANGE]:
    '../../../../assets/templates/email/projectStatusChange.html',
  [templateNames.EMAIL_CONFIRMATION]:
    '../../../../assets/templates/email/confirmEmail.html',
  [templateNames.RECOVERY_PASSWORD]:
    '../../../../assets/templates/email/recoveryPassword.html',
  [templateNames.ALERT]: '../../../../assets/templates/email/alert.html',
  [templateNames.WELCOME]:
  '../../../../assets/templates/email/welcome.html',
};

const getTemplatePath = template =>
  path.join(__dirname, templatePaths[template]);

const loadTemplate = async (template, read = readFile) => {
  if (!Object.keys(templatePaths).includes(template)) {
    logger.error(`[TemplateLoader] :: Email template ${template} not found`);
    throw new COAError(errors.mail.TemplateNotFound);
  }
  const filePath = getTemplatePath(template);
  const file = read(filePath);
  return file;
};

module.exports = {
  loadTemplate,
  getTemplatePath,
  templateNames
};
