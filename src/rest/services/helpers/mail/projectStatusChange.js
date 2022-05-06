const config = require('config');
const { projectStatuses } = require('../../../util/constants');

const recipients = {
  OWNER: 'owner',
  FOLLOWER: 'follower',
  SUPPORTER: 'supporter',
  ANY: 'any'
};

const getSubtitleMap = projectName => ({
  [projectStatuses.REJECTED]: `Project ${projectName} has been rejected`,
  [projectStatuses.PUBLISHED]: `Project ${projectName} has been published`,
  [projectStatuses.CONSENSUS]: `Project ${projectName} has entered the consensus phase`,
  [projectStatuses.FUNDING]: `Project ${projectName} has entered the funding phase`,
  [projectStatuses.EXECUTING]: `Project ${projectName} has entered the executing phase`,
  [projectStatuses.FINISHED]: `Project ${projectName} has finished!`,
  [projectStatuses.CHANGING_SCOPE]: `Project ${projectName} is changing its scope`,
  [projectStatuses.ABORTED]: `Project ${projectName} has been aborted`,
  [projectStatuses.CANCELLED]: `Project ${projectName} has been cancelled`,
  [projectStatuses.ARCHIVED]: `Project ${projectName} has been archived`
});

const mainTitleMap = {
  [recipients.ANY]: 'A project has been updated',
  [recipients.OWNER]: 'A project you own has been updated',
  [recipients.FOLLOWER]: 'A project you follow has been updated',
  [recipients.SUPPORTER]: 'A project you applied to has been updated'
};

const getProjectDetailUrl = projectId =>
  `${config.frontendUrl}/project-detail?id=${projectId}`;

const getEditProjectUrl = projectId =>
  `${config.frontendUrl}/create-project?id=${projectId}`;

/**
 * Returns the information with which the template should be filled
 * @param {object} project project's data
 * @param {string} newStatus status project is changing to
 * @param {'owner' | 'follower' | 'supporter' | 'any' } recipient
 */
const getBodyContent = (project, newStatus, recipient = recipients.ANY) => {
  const { projectName, id } = project;

  const url =
    newStatus === projectStatuses.REJECTED
      ? getEditProjectUrl(id)
      : getProjectDetailUrl(id);

  const bodyContent = {
    subTitle: getSubtitleMap(projectName)[newStatus],
    linkUrl: url,
    buttonUrl: url,
    buttonText: 'Go to project!',
    mainTitle: mainTitleMap[recipient]
  };

  return bodyContent;
};

module.exports = {
  getBodyContent
};
