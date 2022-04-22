const handlers = require('../services/eth/eventListeners/handlers');
const { registerHandlers } = require('./listener');
const logger = require('../logger');

module.exports = {
  registerEvents: async (contract, contractName) => {
    logger.info(
      `[RegisterEvents] :: registering event listeners for contract ${contractName} ${
        contract.address
      }`
    );
    const contractHandlers = handlers[contractName];
    registerHandlers(contract, contractHandlers);
  }
};
