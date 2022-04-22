const { coa } = require('@nomiclabs/buidler');
const { registerEvents } = require('../../util/events');
const logger = require('../../logger');
const { ethProvider } = require('./ethProvider');

const ethInit = async () => {
  logger.info('ethInit :: initializing eth');
  ethProvider();
  const contract = await coa.getCOA();
  const registry = await coa.getRegistry();
  const daos = await coa.getDaos();
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < daos.length; i++) {
    const currentAddress = await daos[i].address;
    const dao = await coa.getDaoContract(currentAddress);
    await registerEvents(dao, 'DAO');
  }
  await registerEvents(contract, 'COA');
  await registerEvents(registry, 'ClaimsRegistry');
};

module.exports = {
  ethInit
};
