/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txEvidenceStatus, evidenceStatus } = require('../util/constants');

module.exports = {
  async findById(id) {
    return this.model
      .findOne({ id })
      .populate('activity')
      .populate('files')
      .populate('user')
      .populate('auditor');
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
  },

  async deleteEvidence(evidenceId) {
    return this.model.destroyOne(evidenceId);
  },

  async getEvidencesByActivityId(activityId) {
    return this.model.find({ activity: activityId }).populate('files');
  },

  async getApprovedEvidences({ tasksIds, limit }) {
    return limit
      ? this.model
          .find({ activity: { in: tasksIds }, status: evidenceStatus.APPROVED })
          .limit(limit)
          .populate('activity')
          .populate('user')
      : this.model
          .find({ activity: { in: tasksIds } })
          .populate('activity')
          .populate('user');
  }
};
