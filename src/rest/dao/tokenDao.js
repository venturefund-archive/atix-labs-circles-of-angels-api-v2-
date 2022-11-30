const logger = require('../logger');

module.exports = {
  async getTokenBySymbol(symbol) {
    logger.info('[TokenDao] :: Entering getTokenBySymbol method');
    return this.model.findOne({
      symbol
    });
  }
};
