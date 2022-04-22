const mime = require('mime');
const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const MIME_TYPES = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  DOC: 'application/msword',
  DOCX:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PDF: 'application/pdf'
};

const imgValidator = file => {
  logger.info('[ValidateMtype] :: Entering imgValidator method');
  logger.info(`[ValidateMtype] :: Looking for fileType of file ${file.name}`);
  const fileType = mime.lookup(file.name);
  const validTypes = [MIME_TYPES.PNG, MIME_TYPES.JPEG];
  if (!validTypes.includes(fileType)) {
    logger.error('[ValidateMtype] :: File type is not a valid img type');
    throw new COAError(errors.file.ImgFileTyPeNotValid);
  }
};

const xlsValidator = file => {
  logger.info('[ValidateMtype] :: Entering xsl method');
  logger.info(`[ValidateMtype] :: Looking for fileType of file ${file.name}`);
  const fileType = mime.lookup(file.name);
  const validTypes = [MIME_TYPES.XLS, MIME_TYPES.XLSX];
  if (!validTypes.includes(fileType)) {
    logger.error('[ValidateMtype] :: File type is not a valid excel type');
    throw new COAError(errors.file.MilestoneFileTypeNotValid);
  }
};

const docValidator = file => {
  logger.info('[ValidateMtype] :: Entering doc method');
  logger.info(`[ValidateMtype] :: Looking for fileType of file ${file.name}`);
  const fileType = mime.lookup(file.name);
  const validTypes = [MIME_TYPES.DOCX, MIME_TYPES.DOC, MIME_TYPES.PDF];
  if (!validTypes.includes(fileType)) {
    logger.error('[ValidateMtype] :: File type is not a valid doc or pdf type');
    throw new COAError(errors.file.DocFileTypeNotValid);
  }
};

// TODO: these validators for each type should be indicated in files.fileSaver object
const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xlsValidator,
  claims: imgValidator,
  transferClaims: imgValidator,
  experiencePhoto: imgValidator,
  transferReceipt: imgValidator,
  agreementFile: docValidator,
  proposalFile: docValidator,
  milestoneClaim: imgValidator
};

/**
 * Validates the type of a file is the correct one
 * @param {'coverPhoto' | 'thumbnail' | 'milestones'
 * | 'experiencePhoto' | 'transferReceipt' | 'agreementFile'
 * | 'proposalFile' } type - Type of file
 * @param {File} file - File to validate
 */
module.exports = (type, file) => mtypesValidator[type](file);
