const { common } = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');
const validateMtype = require('./validateMtype');
const validatePhotoSize = require('./validatePhotoSize');

const logger = require('../../logger');

module.exports = ({ filePathOrHash, fileParam, paramName, method, type }) => {
  logger.info('[validateFile] :: Entering validateFileInFirstUpdate method');
  if (!filePathOrHash && !fileParam) {
    logger.info(
      `[validateFile] :: In the first update the ${paramName} field is required`
    );
    throw new COAError(common.RequiredParamsMissing(method));
  }
  if (fileParam) {
    validateMtype(type, fileParam);
    validatePhotoSize(fileParam);
  }
};
