const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

module.exports = (realOwnerId, userId) => {
  logger.info('[ValidateOwnership] :: Entering validateOwnership method');
  if (realOwnerId !== userId)
    throw new COAError(errors.user.UserIsNotOwnerOfProject);

  return true;
};
