const config = require('config');
const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const MAX_PHOTO_SIZE = config.fileServer.maxFileSize;

/**
 * Validates that the file size is not larger than the max allowed
 * @param {File} file - File to validate its size
 */
module.exports = (file, maxSize = MAX_PHOTO_SIZE) => {
  // TODO: change file name to validateFileSize
  logger.info('[ValidatePhotoSize] :: Entering validatePhotoSize method');
  if (file.size > maxSize) {
    logger.error(
      '[ValidatePhotoSize] :: File size is bigger than the size allowed'
    );
    throw new COAError(errors.file.ImgSizeBiggerThanAllowed);
  }
};
