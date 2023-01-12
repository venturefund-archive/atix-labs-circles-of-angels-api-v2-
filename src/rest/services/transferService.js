/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to
 * develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('hardhat');
const {
  txFunderStatus,
  projectStatuses,
  userRoles,
  publicProjectStatuses
} = require('../util/constants');
const { sha3 } = require('../util/hash');
const files = require('../util/files');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const {
  buildBlockURL,
  buildTxURL,
  buildAddressURL
} = require('./helpers/txExplorerHelper');
const errors = require('../errors/exporter/ErrorExporter');
const COAError = require('../errors/COAError');
const logger = require('../logger');

module.exports = {
  /**
   * Creates a transfer from one user to another user's account.
   * Returns an object with the created transfer's `id`
   * @param {Object} transfer - The transfer to be created
   * @param {number} transfer.transferId
   * @param {number} transfer.senderId
   * @param {string} transfer.destinationAccount
   * @param {number} transfer.amount
   * @param {string} transfer.currency
   * @param {number} transfer.projectId
   * @returns {{ transferId: number }} transfer's `id` field
   */
  async createTransfer({
    transferId,
    senderId,
    destinationAccount,
    amount,
    currency,
    projectId,
    receiptFile
  }) {
    logger.info('[TransferService] :: Entering createTransfer method');
    validateRequiredParams({
      method: 'createTransfer',
      params: {
        transferId,
        senderId,
        destinationAccount,
        amount,
        currency,
        projectId,
        receiptFile
      }
    });
    const project = await this.projectService.getProjectById(projectId);
    const user = await this.userService.getUserById(senderId);

    if (user.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(`[TransferService] :: User ${user.id} is not a funder`);
      throw new COAError(errors.user.UnauthorizedUserRole(user.role));
    }

    // TODO check if another status will allow transfers
    if (project.status !== projectStatuses.FUNDING) {
      logger.error(
        `[TransferService] :: Project ${project.id} is not on consensus phase`
      );
      throw new COAError(
        errors.transfer.ProjectCantReceiveTransfers(project.status)
      );
    }

    const existingTransfer = await this.transferDao.getTransferById({
      transferId
    });

    // TODO: define what should be done with the reconciliation status
    if (
      existingTransfer &&
      existingTransfer.status !== txFunderStatus.CANCELLED
    ) {
      logger.error(
        `[TransferService] :: Transfer ${
          existingTransfer.id
        } with same tranferId already exists`
      );
      throw new COAError(errors.transfer.TransferIdAlreadyExists(transferId));
    }

    validateMtype('transferReceipt', receiptFile);
    validatePhotoSize(receiptFile);
    const receiptPath = await files.saveFile('transferReceipt', receiptFile);

    const transfer = {
      transferId,
      senderId,
      destinationAccount,
      amount,
      currency,
      projectId,
      receiptPath
    };
    logger.info('[TransferService] :: Creating transfer with params', transfer);
    const created = await this.transferDao.create({
      ...transfer,
      status: txFunderStatus.PENDING
    });
    logger.info(
      '[TransferService] :: New transfer created with id',
      created.id
    );

    return { transferId: created.id };
  },

  /**
   * Recieves a tx hash and updates the transfer status
   *
   * @param {string} txHash
   * @param {string} status
   */
  async updateTransferStatusByTxHash(txHash, status) {
    logger.info(
      '[TransferService] :: Entering updateTransferStatusByTxHash method'
    );
    validateRequiredParams({
      method: 'updateTransferStatusByTxHash',
      params: { txHash, status }
    });
    const transfer = await this.transferDao.findByTxHash(txHash);
    if (!transfer) {
      logger.error(
        `[TransferService] :: Transfer with txHash ${txHash} could not be found`
      );
      throw new COAError(
        errors.common.CantFindModelWithTxHash('fund_transfer', txHash)
      );
    }
    return this.updateTransfer(transfer.id, { status });
  },

  /**
   * Updates an existing transfer status
   * Returns its `id` if successfully updated
   * @param {number} id - Transfer's `id` field
   * @param {Object} status - New status to update the transfer with
   * @param {string} status.status
   * @returns {Promise<{ transferId: number }>} transfer's `id` field
   */
  async updateTransfer(id, { status }) {
    logger.info('[TransferService] :: Entering updateTransfer method');
    validateRequiredParams({
      method: 'updateTransfer',
      params: { id, status }
    });

    const transfer = await checkExistence(
      this.transferDao,
      id,
      'fund_transfer'
    );

    if (!Object.values(txFunderStatus).includes(status)) {
      logger.error(
        `[TransferService] :: Transfer status '${status}' is not valid`
      );
      throw new COAError(errors.transfer.TransferStatusNotValid(status));
    }

    // TODO: define what to do with RECONCILIATION status
    if (
      [txFunderStatus.VERIFIED, txFunderStatus.CANCELLED].includes(
        transfer.status
      )
    ) {
      logger.error('[TransferService] :: Transfer status cannot be changed', {
        id: transfer.id,
        status: transfer.status
      });
      throw new COAError(
        errors.transfer.TransferStatusCannotChange(transfer.status)
      );
    }

    const updated = await this.transferDao.update({ id, status });
    return { transferId: updated.id };
  },

  /**
   * Returns an array with all transfers for the specified project
   * @param {number} projectId - Project to get all transfers from
   * @returns {{ transfers: array }}
   */
  async getAllTransfersByProject(projectId) {
    logger.info(
      '[TransferService] :: Entering getAllTransfersByProject method'
    );
    validateRequiredParams({
      method: 'getAllTransfersByProject',
      params: { projectId }
    });

    const project = await this.projectService.getProjectById(projectId);

    // TODO: define in which project phase/s this list would make sense
    if (!Object.values(publicProjectStatuses).includes(project.status)) {
      logger.error(
        '[TransferService] :: Project has not been approved yet',
        project
      );
      throw new COAError(errors.project.ProjectNotApproved);
    }

    logger.info(
      '[TransferService] :: Getting all transfer for project',
      projectId
    );

    // TODO: might have to add pagination
    const transfers = await this.transferDao.getAllTransfersByProject(
      projectId
    );

    logger.info(
      `[TransferService] :: Found ${transfers.length} for project ${projectId}`
    );
    return transfers;
  },

  /**
   * Returns an array with all transfers that match the criteria passed as parameter
   * @param {{ filters: object, populate: object }} props
   * @returns {Promise<transfer[]>}
   */
  async getAllTransfersByProps(props) {
    logger.info('[TransferService] :: Entering getAllTransfersByProps method');

    const filters = props ? props.filters : {};
    const populate = props ? props.populate : {};

    logger.info('[TransferService] :: Getting all transfers with options', {
      filters,
      populate
    });
    const transfers = await this.transferDao.findAllByProps(filters, populate);
    logger.info(`[TransferService] :: Found ${transfers.length} transfers`);
    return transfers;
  },

  async getTransferById({ transferId }) {
    return this.transferDao.findTransferById(transferId);
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await this.transferDao.getTransferStatusByUserAndProject({
      senderId,
      projectId
    });
    return transfer;
  },

  /**
   * Finds all approved funds for a project and returns the total amount
   *
   * @param {number} projectId
   * @returns total funded amount || error
   */
  async getFundedAmount({ projectId }) {
    logger.info('[TransferService] :: Entering getFundedAmount method');
    validateRequiredParams({
      method: 'getFundedAmount',
      params: { projectId }
    });

    const project = await this.projectService.getProjectById(projectId);

    if (!Object.values(publicProjectStatuses).includes(project.status)) {
      logger.error(
        `[TransferService] :: Can't get total fund amount when project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.project.InvalidStatusForGetFundAmount(project.status)
      );
    }

    const transfers = await this.transferDao.findAllByProps({
      project: projectId,
      status: txFunderStatus.VERIFIED,
      rejectionReason: null
    });

    const totalAmount = transfers.reduce(
      (total, transfer) => total + transfer.amount,
      0
    );

    logger.info(
      `[Transfer Service] :: Project ${projectId} has ${totalAmount} total funds`
    );

    return { fundedAmount: totalAmount };
  },

  /**
   * Sends the signed transaction to add a transfer claim
   * to the `ClaimsRegistry` contract and updates the transfer in db
   * @param {number} transferId
   * @param {number} userId
   * @param {boolean} approved
   * @param {String} rejectionReason
   * @param {Transaction} signedTransaction
   */
  async sendAddTransferClaimTransaction({
    transferId,
    userId,
    approved,
    rejectionReason,
    signedTransaction,
    userAddress
  }) {
    logger.info(
      '[TransferService] :: Entering sendAddTransferClaimTransaction method'
    );
    validateRequiredParams({
      method: 'sendAddTransferClaimTransaction',
      params: { transferId, userId, approved, signedTransaction, userAddress }
    });
    await this.validateAddTransferClaim({ transferId, userId, approved });

    logger.info(
      '[TransferService] :: Sending signed tx to the blockchain for transfer',
      transferId
    );

    const tx = await coa.sendNewTransaction(signedTransaction);
    logger.info('[TransferService] :: Add claim transaction sent');

    const fields = {
      id: transferId,
      status: txFunderStatus.SENT,
      txHash: tx.hash
    };
    if (!approved && rejectionReason) fields.rejectionReason = rejectionReason;

    const updated = await this.transferDao.update(fields);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    logger.info('[TransferService] :: Claim added and status transfer updated');
    return { transferId: updated.id };
  },

  /**
   * Returns the user encrypted wallet and the unsigned transaction
   * to add a transfer claim to the `ClaimsRegistry` contract
   * @param {number} transferId
   * @param {number} userId
   * @param {boolean} approved
   * @param {JSON} userWallet
   */
  async getAddTransferClaimTransaction({
    transferId,
    userId,
    approved,
    userWallet
  }) {
    logger.info(
      '[TransferService] :: Entering getAddTransferClaimTransaction method'
    );
    validateRequiredParams({
      method: 'getAddTransferClaimTransaction',
      params: { transferId, userId, approved, userWallet }
    });
    logger.info('[TransferService] :: Getting add claim transaction');
    await this.validateAddTransferClaim({ transferId, userId, approved });

    const { project: projectId, receiptPath } = await this.transferDao.findById(
      transferId
    );
    const project = await this.projectService.getProjectById(projectId);
    const claim = sha3(projectId, userId, transferId);
    const proof = sha3(receiptPath); // TODO: this should be an ipfs hash

    const { address: projectAddress } = project;
    if (!projectAddress) {
      logger.error(
        `[TransferService] :: Address not found for project ${project.id}`
      );
      throw new COAError(errors.project.AddressNotFound(project.id));
    }

    try {
      const unsignedTx = await coa.getAddClaimTransaction(
        projectAddress,
        claim,
        proof,
        approved,
        0 // 0 because it doesn't belong to a milestone
      );
      const nonce = await this.transactionService.getNextNonce(
        userWallet.address
      );
      const txWithNonce = { ...unsignedTx, nonce };

      logger.info(
        '[TransferService] :: Sending unsigned transaction to client',
        txWithNonce
      );
      return {
        tx: txWithNonce,
        encryptedWallet: userWallet.encryptedWallet
      };
    } catch (error) {
      logger.info(`[TransferService] :: Blockchain error :: ${error}`);
      throw new COAError(error);
    }
  },

  /**
   * Returns `true` or throws an error if the transfer cannot be modified
   * @param {number} transferId
   * @param {number} userId
   * @param {boolean} approved
   */
  async validateAddTransferClaim({ transferId, userId, approved }) {
    logger.info(
      '[TransferService] :: Entering validateAddTransferClaim method'
    );
    validateRequiredParams({
      method: 'validateAddTransferClaim',
      params: { transferId, userId, approved }
    });

    const user = await this.userService.getUserById(userId);
    if (user.role !== userRoles.BANK_OPERATOR) {
      logger.error(
        `[TransferService] :: User ${userId} not authorized for this action`
      );
      throw new COAError(errors.common.UserNotAuthorized(userId));
    }

    const transfer = await checkExistence(
      this.transferDao,
      transferId,
      'fund_transfer'
    );

    const { status: currentStatus } = transfer;
    const { VERIFIED, CANCELLED } = txFunderStatus;

    if ([VERIFIED, CANCELLED].includes(currentStatus)) {
      logger.error(
        '[Transfer Service] :: Transfer status transition is not valid'
      );
      throw new COAError(errors.transfer.InvalidTransferTransition);
    }
    return true;
  },

  /**
   * Returns the blockchain information for the specified fund transfer
   * @param {number} transferId
   */
  async getBlockchainData(transferId) {
    logger.info('[TransferService] :: Entering getBlockchainData method');
    const transfer = await checkExistence(
      this.transferDao,
      transferId,
      'fund_transfer'
    );

    const { txHash, receiptPath } = transfer;
    if (!txHash) {
      logger.info(
        `[TransferService] :: Transfer ${transferId} does not have blockchain information`
      );
      throw new COAError(errors.transfer.BlockchainInfoNotFound(transferId));
    }

    logger.info(
      `[TransferService] :: Getting transaction response for ${txHash}`
    );
    const txResponse = await coa.getTransactionResponse(txHash);
    // not sure if this is necessary
    if (!txResponse) {
      logger.info(
        `[TransferService] :: Transfer ${transferId} does not have blockchain information`
      );
      throw new COAError(errors.transfer.BlockchainInfoNotFound(transferId));
    }
    const { blockNumber, from } = txResponse;
    let timestamp;
    if (blockNumber) {
      try {
        const block = await coa.getBlock(blockNumber);
        ({ timestamp } = block);
      } catch (error) {
        logger.info(`[TransferService] :: Blockchain error :: ${error}`);
        throw new COAError(error);
      }
    }

    return {
      validatorAddress: from,
      validatorAddressUrl: from ? buildAddressURL(from) : undefined,
      txHash,
      txHashUrl: txHash ? buildTxURL(txHash) : undefined,
      creationDate: timestamp ? new Date(timestamp * 1000) : undefined,
      blockNumber,
      blockNumberUrl: blockNumber ? buildBlockURL(blockNumber) : undefined,
      receipt: receiptPath
    };
  },
  /**
   * Checks all transfer transactions and
   * updates their status to the ones that failed.
   *
   * Returns an array with all failed transfer ids
   *
   */
  async updateFailedTransactions() {
    logger.info(
      '[TransferService] :: Entering updateFailedTransactions method'
    );
    const sentTxs = await this.transferDao.findAllSentTxs();
    logger.info(
      `[TransferService] :: Found ${sentTxs.length} sent transactions`
    );
    const updated = await Promise.all(
      sentTxs.map(async ({ id, txHash }) => {
        const hasFailed = await this.transactionService.hasFailed(txHash);
        if (hasFailed) {
          try {
            const { transferId } = await this.updateTransfer(id, {
              status: txFunderStatus.FAILED
            });
            return transferId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              "[TransferService] :: Couldn't update failed transaction status",
              txHash
            );
          }
        }
      })
    );
    const failed = updated.filter(tx => !!tx);
    if (failed.length > 0) {
      logger.info(
        `[TransferService] :: Updated status to ${
          txFunderStatus.FAILED
        } for transfers ${failed}`
      );
    } else {
      logger.info('[TransferService] :: No failed transactions found');
    }
    return failed;
  },
  /**
   * Checks all transfer transactions and
   * update to verified if transfer has not failed
   * after a specified number of blocks
   *
   * Returns an array with all verified transfer ids
   *
   */
  async updateVerifiedTransferTransactions(currentBlockNumber) {
    logger.info(
      '[TransferService] :: Entering updateVerifiedTransferTransactions method'
    );
    const txs = await this.transferDao.findAllPendingVerificationTxs();
    logger.info(
      `[TransferService] :: Found ${
        txs.length
      } pending of verification transactions`
    );
    const updated = await Promise.all(
      txs.map(async ({ id, txHash }) => {
        if (!txHash) {
          logger.error(`[TransferService] :: Transfer ${id} has not txHash`);
          return;
        }
        const { blockNumber } = await coa.getTransactionResponse(txHash);
        const hasVerified = await this.transactionService.hasVerified(
          blockNumber,
          currentBlockNumber
        );
        if (hasVerified) {
          try {
            const { transferId } = await this.updateTransfer(id, {
              status: txFunderStatus.VERIFIED
            });
            return transferId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              "[TransferService] :: Couldn't update verified transaction status",
              txHash
            );
          }
        }
      })
    );
    const verified = updated.filter(tx => !!tx);
    if (verified.length > 0) {
      logger.info(
        `[TransferService] :: Updated status to ${
          txFunderStatus.VERIFIED
        } for transfers ${verified}`
      );
    } else {
      logger.info('[TransferService] :: No verified transactions found');
    }
    return verified;
  }
};
