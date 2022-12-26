const logger = require('../logger');

module.exports = {
  async getChangelogBy(where) {
    logger.info('[ChangelogDao] :: Entering getChangelogBy method');
    return this.model
      .find(where)
      .populate('project')
      .populate('milestone')
      .populate('activity')
      .populate('evidence')
      .populate('user')
      .sort('id DESC');
  },
  createChangelog(newChangelog) {
    return this.model.create(newChangelog);
  }
};
