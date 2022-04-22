/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop
 * impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txProposalStatus } = require('../util/constants');

module.exports = {
  async findById(id) {
    return this.model.findOne({ id });
  },

  async findByTxHash(txHash) {
    return this.model.findOne({ txHash });
  },

  async addProposal(data) {
    const proposalCreated = await this.model.create(data);
    return proposalCreated;
  },

  async getByDaoAndProposalId(daoId, proposalId) {
    return this.model.find({ daoId, proposalId });
  },

  async updateProposal(proposalId, data) {
    const updatedProposal = await this.model
      .updateOne({ id: proposalId })
      .set(data);
    return updatedProposal;
  },

  async updateProposalByTxHash(txHash, data) {
    const updatedProposal = await this.model.updateOne({ txHash }).set(data);
    return updatedProposal;
  },

  async findAllSentTxsByDaoId(daoId) {
    const txs = await this.model.find({ status: txProposalStatus.SENT, daoId });
    return txs;
  },

  async findAllSentTxs() {
    const txs = await this.model.find({
      select: ['id', 'txHash'],
      where: { status: txProposalStatus.SENT }
    });
    return txs;
  }
};
