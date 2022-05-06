const mime = require('mime');
const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');
const validateOwnership = require('./validateOwnership');

const logger = require('../../logger');

const MAX_PHOTO_SIZE = 500000;

// TODO: this file should eventually be deleted

const validateExistence = async (dao, id, model) => {
  logger.info('[ProjectServiceHelper] :: Entering validaExistence method');
  logger.info(
    `[ProjectServiceHelper] :: About to validate if ${model} with id ${id} exists`
  );
  const object = await dao.findById(id);
  if (object) {
    logger.info(`[ProjectServiceHelper] :: ${model} found`);
    return new Promise(resolve => resolve(object));
  }
  logger.error(`${model} with id ${id} not found`);
  return new Promise((resolve, reject) =>
    reject(new COAError(errors.common.CantFindModelWithId(model, id)))
  );
};

const validateParams = (...params) => {
  logger.info('[ProjectServiceHelper :: Entering validateParams method');
  if (!params.reduce((prev, current) => prev && current, true)) {
    logger.error(
      '[ProjectServiceHelper] :: There are one or more params that are undefined. Request is not valid'
    );
    throw new COAError(errors.project.CreateProjectFieldsNotValid);
  }
};

const imgValidator = file => {
  logger.info('[ProjectServiceHelper] :: Entering imgValidator method');
  logger.info(
    `[ProjectServiceHelper] :: Looking for fileType of file ${file.name}`
  );
  const fileType = mime.lookup(file.name);
  if (!fileType.includes('image/')) {
    logger.error('[ProjectServiceHelper] :: File type is not a valid img type');
    throw new COAError(errors.file.ImgFileTyPeNotValid);
  }
};

const xslValidator = file => {
  logger.info('[ProjectServiceHelper] :: Entering xsl method');
  logger.info(
    `[ProjectServiceHelper] :: Looking for fileType of file ${file.name}`
  );
  const fileType = mime.lookup(file.name);
  if (
    !(
      fileType === 'application/vnd.ms-excel' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  ) {
    logger.error(
      '[ProjectServiceHelper] :: File type is not a valid excel type'
    );
    throw new COAError(errors.file.MilestoneFileTypeNotValid);
  }
};

const mtypesValidator = {
  coverPhoto: imgValidator,
  thumbnail: imgValidator,
  milestones: xslValidator,
  experiencePhoto: imgValidator
};

const validateMtype = type => file => mtypesValidator[type](file);

const validatePhotoSize = file => {
  logger.info('[ProjectServiceHelper] :: Entering validatePhotosSize method');
  if (file.size > MAX_PHOTO_SIZE) {
    logger.error(
      '[ProjectServiceHelper] :: File size is bigger than the size allowed'
    );
    throw new COAError(errors.file.ImgSizeBiggerThanAllowed);
  }
};

module.exports = {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize,
  validateOwnership,
  xslValidator,
  imgValidator
};
