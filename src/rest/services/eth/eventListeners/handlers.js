const coaHandlers = require('./coaHandlers');
const daoHandlers = require('./daoHandlers');
const superDaoHandlers = require('./superDaoHandlers');
const claimsRegistryHandlers = require('./claimsRegistryHandlers');

/**
 * Maps contracts events to their handler.
 * key: contract name,
 * value: object with event -> handler mapping for every event of the contract
 */
module.exports = {
  COA: coaHandlers,
  DAO: daoHandlers,
  SuperDAO: superDaoHandlers,
  ClaimsRegistry: claimsRegistryHandlers
};
