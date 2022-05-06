/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txFunderStatus } = require('../util/constants');

module.exports = {
  async findById(id) {
    return this.model.findOne({ id });
  },

  async findByTxHash(txHash) {
    return this.model.findOne({ txHash });
  },

  async findAllByProps(filters, populate) {
    return this.model.find(filters, populate);
  },

  async create({
    transferId,
    senderId,
    destinationAccount,
    amount,
    currency,
    projectId,
    receiptPath,
    status
  }) {
    return this.model.create({
      transferId,
      amount,
      currency,
      sender: senderId,
      project: projectId,
      destinationAccount,
      receiptPath,
      status
    });
  },

  async update({ id, status, rejectionReason, txHash }) {
    return this.model
      .updateOne({ id })
      .set({ status, rejectionReason, txHash });
  },

  async getTransferById({ transferId }) {
    return this.model.findOne({ transferId });
  },

  async getAllTransfersByProject(projectId) {
    return this.model
      .find({ project: projectId })
      .populate('sender')
      .sort('createdAt DESC');
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await this.model.findOne({
      and: [
        {
          sender: senderId,
          project: projectId
        }
      ]
    });

    return transfer ? transfer.status : undefined;
  },

  async getTransfersByProjectAndState(projectId, status) {
    if (Object.values(txFunderStatus).includes(status)) {
      const transfers = await this.model.find({
        and: [{ project: projectId, status }]
      });
      return transfers;
    }
  },

  async findAllSentTxs() {
    const transfers = await this.findAllByProps({
      select: ['id', 'txHash'],
      where: { status: txFunderStatus.SENT }
    });
    return transfers;
  },

  async findProjectIdsWithTransfers() {
    const transfers = await this.findAllByProps({
      select: ['project']
    });
    const projectIds = transfers.map(t => t.project);
    return projectIds.filter((v, i) => projectIds.indexOf(v) === i);
  },

  async findAllPendingVerificationTxs() {
    const txs = await this.model.find({
      select: ['id', 'txHash'],
      where: { status: txFunderStatus.PENDING_VERIFICATION }
    });
    return txs;
  }
};
