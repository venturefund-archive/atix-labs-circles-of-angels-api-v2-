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

    return Promise.all(
      changelogs.map(async changelog => {
        const roles = await this.userProjectService.getRolesOfUser({
          user: paramObj.user,
          project: paramObj.project
        });
        return { ...changelog, user: { ...changelog.user, roles } };
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
