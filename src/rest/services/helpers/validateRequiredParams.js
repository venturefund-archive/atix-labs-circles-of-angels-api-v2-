const { common } = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

/**
 * Validate that all required params are defined.
 * Throws an error if any is `undefined`
 * @param {Object} args - Method's name and required params to validate
 * @param {string} args.method - method's name
 * @param {Object} args.params - method's required parameters
 */
module.exports = ({ method, params }) => {
  logger.info(
    '[ValidateRequiredParams] :: Entering validateRequiredParams method'
  );
  const undefinedParams = Object.keys(params).filter(
    key => params[key] === undefined || params[key] === null
  );
  if (undefinedParams.length > 0) {
    logger.error(
      `[ValidateRequiredParams] :: There are one or more params that are undefined for ${method}: ${undefinedParams}`
    );
    throw new COAError(common.RequiredParamsMissing(method));
  }
};
