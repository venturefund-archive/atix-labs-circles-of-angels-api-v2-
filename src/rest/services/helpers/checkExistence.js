const { isEmpty } = require('lodash');
const { common } = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

/**
 * Looks up a record in database to check its existence.
 * Returns the object found or throws an error if not exists.
 * @param {Object} dao - Corresponding DAO for the record
 * @param {number} id - Id of the record to look up
 * @param {string} model - Corresponding model name for the record
 */
module.exports = async (dao, id, model) => {
  logger.info('[CheckExistence] :: Entering checkExistence method');
  logger.info(
    `[CheckExistence] :: About to check if ${model} with id ${id} exists`
  );
  const returnedObject = await dao.findById(id);
  if (isEmpty(returnedObject)) {
    logger.error(`[CheckExistence] :: ${model} with id ${id} not found`);
    throw new COAError(common.CantFindModelWithId(model, id));
  }
  logger.info(`[CheckExistence] :: ${model} found`);
  return returnedObject;
};
