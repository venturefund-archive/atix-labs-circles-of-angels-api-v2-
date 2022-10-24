const { common } = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

module.exports = ({ filePathOrHash, fileParam, paramName, method }) => {
  logger.info(
    '[validateFileInFirstUpdate] :: Entering validateFileInFirstUpdate method'
  );
  if (!filePathOrHash && !fileParam) {
    logger.info(
      `[validateFileInFirstUpdate] :: In the first update the ${paramName} field is required`
    );
    throw new COAError(common.RequiredParamsMissing(method));
  }
};
