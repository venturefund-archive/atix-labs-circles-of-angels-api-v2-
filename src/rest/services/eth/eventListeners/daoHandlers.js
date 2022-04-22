const logger = require('../../../logger');
const daoService = require('../../daoService');
const { txProposalStatus } = require('../../../util/constants');

module.exports = {
  SubmitVote: async (_proposalIndex, memberAddress, vote, tx) => {
    const { transactionHash } = tx;

    logger.info('[COA] :: Incoming event SubmitVote');
    const updated = await daoService.updateVoteByTxHash(
      transactionHash,
      txProposalStatus.CONFIRMED
    );
    if (updated) {
      logger.info(
        `[DaoHandler] :: Vote for Proposal ${
          updated.proposalId
        } status updated to ${txProposalStatus.CONFIRMED}`
      );
    } else {
      logger.info(
        `[DaoHandler] :: Couldn't update vote with txHash ${transactionHash}`
      );
    }
  },
  ProcessProposal: args => {
    // TODO: do this or remove if not needed
    logger.info('DAO.ProcessProposal', args);
  },
  SubmitProposal: async (
    proposalIndex,
    memberAddress,
    applicant,
    proposalType,
    tx
  ) => {
    const { transactionHash } = tx;
    const proposalId = proposalIndex.toNumber();

    logger.info('[COA] :: Incoming event SubmitProposal');
    const updated = await daoService.updateProposalByTxHash(
      transactionHash,
      txProposalStatus.CONFIRMED,
      proposalId
    );
    if (updated) {
      logger.info(
        `[DaoHandler] :: Proposal ${updated.proposalId} status updated to ${
          txProposalStatus.CONFIRMED
        }`
      );
    } else {
      logger.info(
        `[DaoHandler] :: Couldn't update proposal with txHash ${transactionHash}`
      );
    }
  }
};
