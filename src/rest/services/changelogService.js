const logger = require('../logger');

module.exports = {
  async getChangelog(paramObj) {
    logger.info('[ChangelogService] :: Entering getChangelog method');

    logger.info('[ChangelogService] :: Filter undefined params');
    const where = Object.fromEntries(
      Object.entries(paramObj).filter(value => value[1])
    );

    logger.info('[ChangelogService] :: Params to get changelog', where);

    const changelogs = await this.changelogDao.getChangelogBy(where);

    logger.info('[ChangelogService] :: Fill user roles');

    const changelogsWithUserRoles = await Promise.all(
      changelogs.map(async changelog => {
        if (changelog.user) {
          const roles = await this.userProjectService.getRolesOfUser({
            user: changelog.user.id,
            project: paramObj.project
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
  }
};
