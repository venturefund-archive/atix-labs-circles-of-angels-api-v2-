const logger = require('../logger');

module.exports = {
  async getChangelogBy(where) {
    logger.info('[ChangelogDao] :: Entering getChangelogBy method');
    return this.model.find(where).populate('user');
  }
};
