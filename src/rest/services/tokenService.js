const logger = require('../logger');

module.exports = {
  async getTokenBySymbol(symbol) {
    logger.info('[TokenService] :: Entering getTokenBySymbol method');
    logger.info(`[TokenService] :: Get token with symbol ${symbol}`);
    return this.tokenDao.getTokenBySymbol(symbol);
  }
};
