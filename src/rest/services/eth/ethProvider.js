const { ethers } = require('@nomiclabs/buidler');
const logger = require('../../logger');
const transferService = require('../../services/transferService');
const activityService = require('../../services/activityService');

const ethProvider = () =>
  ethers.provider.on('block', async blockNumber => {
    logger.info(`[ethProvider] :: block ${blockNumber}`);
    await transferService.updateVerifiedTransferTransactions(blockNumber);
    await activityService.updateVerifiedEvidenceTransactions(blockNumber);
  });

module.exports = {
  ethProvider
};
