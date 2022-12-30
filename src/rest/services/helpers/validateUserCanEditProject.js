const userProjectService = require('../userProjectService');
const COAError = require('../../errors/COAError');
const { projectStatuses, rolesTypes } = require('../../util/constants');

const logger = require('../../logger');

module.exports = async ({ project, user, error }) => {
  const userId = user.id;
  const projectId = project.id;
  const { status } = project;
  logger.info('Entering validateUserCanEditProject method');
  if (user.isAdmin) {
    if (project.status !== projectStatuses.DRAFT)
      throw new COAError(error(status));
  } else {
    if (project.status !== projectStatuses.OPEN_REVIEW) {
      throw new COAError(error(status));
    }
    await userProjectService.getUserProjectFromRoleDescription({
      userId,
      projectId,
      roleDescriptions: [rolesTypes.BENEFICIARY, rolesTypes.FUNDER]
    });
  }
};
