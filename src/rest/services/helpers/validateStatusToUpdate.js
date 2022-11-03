const { projectStatuses } = require('../../util/constants');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const validStatusToUpdate = [projectStatuses.DRAFT];

module.exports = ({ status, error }) => {
  logger.info(
    '[ValidateStatusToUpdate] :: Entering validateStatusToUpdate method'
  );
  if (validStatusToUpdate.every(validStatus => status !== validStatus)) {
    throw new COAError(error(status));
  }
};
