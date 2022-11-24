/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txEvidenceStatus } = require('../util/constants');

module.exports = {
  async findById(id) {
    return this.model.findOne({ id });
  },
  async findByTxHash(txHash) {
    return this.model.findOne({ txHash });
  },

  async addTaskEvidence(data) {
    const evidenceCreated = await this.model.create(data);
    return evidenceCreated;
  },

  async getEvidencesByTaskId(taskId) {
    return this.model.find({ activity: taskId });
  },

  async updateTaskEvidence(evidenceId, data) {
    const updatedEvidence = await this.model
      .updateOne({ id: evidenceId })
      .set(data);
    return updatedEvidence;
  },

  async findAllSentTxs() {
    const txs = await this.model.find({
      select: ['id', 'txHash'],
      where: { status: txEvidenceStatus.SENT }
    });
    return txs;
  },

  async findAllPendingVerificationTxs() {
    const txs = await this.model.find({
      select: ['id', 'txHash'],
      where: { status: txEvidenceStatus.PENDING_VERIFICATION }
    });
    return txs;
  }
};
