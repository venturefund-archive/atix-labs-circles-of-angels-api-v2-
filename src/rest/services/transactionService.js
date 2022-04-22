const { coa } = require('@nomiclabs/buidler');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

module.exports = {
  /**
   * Saves a new transaction
   *
   * @param {{ sender: String, txHash: String, nonce: number }} args
   */
  async save({ sender, txHash, nonce }) {
    logger.info('[TransactionService] :: Entering save method');
    validateRequiredParams({
      method: 'save',
      params: { sender, txHash, nonce }
    });
    const transaction = await this.transactionDao.findByTxHash(txHash);
    if (transaction) {
      logger.info(
        `[TransactionService] :: Transaction with hash ${txHash} already exists`
      );
      throw new COAError(errors.transaction.AlreadyExists(txHash));
    }
    await this.userService.getUserByAddress(sender);
    logger.info('[TransactionService] :: Saving new transaction', {
      sender,
      txHash,
      nonce
    });
    const saved = await this.transactionDao.save({ sender, txHash, nonce });
    return saved;
  },
  /**
   * Returns the highest nonce saved for the specified address
   *
   * @param {String} address
   * @returns {Promise<Number>}
   */
  async getHighestNonce(address) {
    logger.info('[TransactionService] :: Entering getHighestNonce method');
    validateRequiredParams({ method: 'getHighestNonce', params: { address } });
    const tx = await this.transactionDao.findLastTxBySender(address);
    if (!tx) {
      logger.info(
        `[TransactionService] :: Address ${address} hasn't made any tx yet`
      );
      return -1;
    }
    logger.info(
      `[TransactionService] :: Highest nonce for address ${address} is ${
        tx.nonce
      }`
    );
    return tx.nonce;
  },
  /**
   * Returns the nonce the address should use
   * to send the next transaction
   *
   * @param {String} address
   * @returns {Promise<Number>}
   */
  async getNextNonce(address) {
    logger.info('[TransactionService] :: Entering getNextNonce method');
    validateRequiredParams({
      method: 'getNextNonce',
      params: { address }
    });
    const highestNonce = await this.getHighestNonce(address);
    const txCount = await coa.getTransactionCount(address);
    logger.info(
      `[TransactionService] :: Tx count for address ${address} is ${txCount}`
    );
    if (highestNonce === -1 || txCount > highestNonce) {
      return txCount;
    }
    return highestNonce + 1;
  },
  /**
   * Checks if the transaction has failed or was removed from the mempool
   *
   * @param {string} txHash
   */
  async hasFailed(txHash) {
    logger.info('[TransactionService] :: Entering hasFailed method');
    validateRequiredParams({
      method: 'hasFailed',
      params: { txHash }
    });
    logger.info(`[TransactionService] :: Checking if ${txHash} has failed`);
    const txReceipt = await coa.getTransactionReceipt(txHash);
    return !txReceipt || txReceipt.status === 0;
  },
  /**
   * Checks if the transaction is still verified after a number of blocks.
   *
   * @param {number} blockNumber
   * @param {number} currentBlockNumber
   */
  async hasVerified(blockNumber, currentBlockNumber) {
    logger.info('[TransactionService] :: Entering hasVerified method');
    validateRequiredParams({
      method: 'hasVerified',
      params: { blockNumber, currentBlockNumber }
    });
    logger.info(
      `[TransactionService] :: Checking if block with block number ${blockNumber} is still verified`
    );
    return currentBlockNumber - blockNumber > process.env.BLOCKS_NUMBER_TO_WAIT;
  }
};
