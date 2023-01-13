const COAError = require('../../errors/COAError');

const logger = require('../../logger');

module.exports = async ({ firstUserId, secondUserId, error }) => {
  logger.info('Entering validateUsersAreEqualsOrThrowError method');
  if (firstUserId !== secondUserId) {
    throw new COAError(error);
  }
};
