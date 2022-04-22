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

  async findByDaoAndProposalId(daoId, proposalId) {
    const votes = await this.model.find({
      select: ['voter'],
      where: { status: { '!=': txProposalStatus.SENT }, daoId, proposalId }
    });
    const voters = votes.map(vote => vote.voter);
    return voters;
  },

  async addVote(data) {
    const voteCreated = await this.model.create(data);
    return voteCreated;
  },

  async updateVote(voteId, data) {
    const updatedVote = await this.model.updateOne({ id: voteId }).set(data);
    return updatedVote;
  },

  async updateVoteByTxHash(txHash, data) {
    const updatedVote = await this.model.updateOne({ txHash }).set(data);
    return updatedVote;
  },

  async findAllSentTxs() {
    const txs = await this.model.find({
      select: ['id', 'txHash'],
      where: { status: txProposalStatus.SENT }
    });
    return txs;
  }
};
