const logger = require('../logger');

module.exports = {
  async getChangelogBy(where) {
    logger.info('[ChangelogDao] :: Entering getChangelogBy method');
    return this.model
      .find(where)
      .populate('milestone')
      .populate('activity')
      .populate('evidence')
      .populate('user')
      .sort('id DESC');
  },
  async createChangelog(newChangelog) {
    return this.model.create(newChangelog);
  },
  async deleteProjectChangelogs(projectId) {
    return this.model.destroy({ project: projectId });
  }
};
