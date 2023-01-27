const logger = require('../logger');

module.exports = {
  changelogFilter(changelog, paramObj) {
    if (
      !(
        (paramObj.milestoneId &&
          changelog.milestone === paramObj.milestoneId) ||
        (paramObj.parentMilestoneId &&
          changelog.milestone === paramObj.parentMilestoneId)
      )
    ) {
      return false;
    }

    if (
      !(
        (paramObj.activityId && changelog.activity === paramObj.activityId) ||
        (paramObj.parentActivityId &&
          changelog.activity === paramObj.parentActivityId)
      )
    ) {
      return false;
    }

    if (
      !(
        (paramObj.evidenceId && changelog.evidence === paramObj.evidenceId) ||
        (paramObj.parentEvidenceId &&
          changelog.evidence === paramObj.parentEvidenceId)
      )
    ) {
      return false;
    }

    if (paramObj.revision && changelog.revision !== paramObj.revision) {
      return false;
    }
    return true;
  },

  async getChangelog(projectId, projectParentId, params) {
    logger.info('[ChangelogService] :: Entering getChangelog method');

    const [projectChangelogs, parentChangelogs] = await Promise.all([
      this.changelogDao.getChangelogBy({
        project: projectId
      }),
      this.changelogDao.getChangelogBy({
        project: projectParentId
      })
    ]);

    let changelogs = [...projectChangelogs, ...parentChangelogs];
    changelogs = changelogs.filter(params);

    logger.info('[ChangelogService] :: Fill user roles');

    const changelogsWithUserRoles = await Promise.all(
      changelogs.map(async changelog => {
        if (changelog.user) {
          const roles = await this.userProjectService.getRolesOfUser({
            user: changelog.user.id,
            project: projectId
          });
          return { ...changelog, user: { ...changelog.user, roles } };
        }
        return changelog;
      })
    );

    logger.info('[ChangelogService] :: Fill activity auditors');

    return Promise.all(
      changelogsWithUserRoles.map(async changelog => {
        if (changelog.activity) {
          const auditor = await this.userService.getUserById(
            changelog.activity.auditor
          );
          const changelogToReturn = {
            ...changelog,
            activity: { ...changelog.activity, auditor }
          };
          return changelogToReturn;
        }
        return changelog;
      })
    );
  },
  createChangelog({
    project,
    revision,
    milestone,
    activity,
    evidence,
    user,
    transaction,
    description,
    action,
    extraData
  }) {
    const newChangelog = {
      project,
      revision,
      milestone,
      activity,
      evidence,
      user,
      transaction,
      description,
      action,
      extraData
    };
    try {
      logger.info(
        `[ChangelogService] :: About to insert changelog with ${JSON.stringify(
          newChangelog
        )}`
      );
      return this.changelogDao.createChangelog(newChangelog);
    } catch (error) {
      logger.error(
        '[ChangelogService] :: There was an error trying to insert changelog ',
        error
      );
    }
  },
  async deleteProjectChangelogs(projectId) {
    logger.info(
      '[ChangelogService] :: Entering deleteProjectChangelogs method'
    );
    return this.changelogDao.deleteProjectChangelogs(projectId);
  }
};
