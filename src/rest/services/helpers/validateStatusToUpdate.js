const { project } = require('../../errors/exporter/ErrorExporter');
const { projectStatuses } = require('../../util/constants');
const COAError = require('../../errors/COAError');

const logger = require('../../logger');

const validStatusToUpdate = [projectStatuses.DRAFT];

module.exports = status => {
  logger.info(
    '[ValidateStatusToUpdate] :: Entering validateStatusToUpdate method'
  );
  if (validStatusToUpdate.every(validStatus => status !== validStatus)) {
    throw new COAError(project.ProjectCantBeUpdated(status));
  }
};
