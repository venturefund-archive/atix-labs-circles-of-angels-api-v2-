const { coa } = require('@nomiclabs/buidler');
const COAError = require('../errors/COAError');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const {
  voteEnum,
  daoMemberRoleNames,
  proposalTypeEnum,
  txProposalStatus
} = require('../util/constants');

module.exports = {
  async getUsers({ daoId }) {
    logger.info('[DAOService] :: Entering getUsers method');
    validateRequiredParams({
      method: 'getUsers',
      params: { daoId }
    });
    /* eslint-disable no-await-in-loop */
    logger.info('[DAOService] :: Getting users of DAO');
    try {
      const users = await this.userService.getUsers();
      const filteredUsers = [];
      for (let i = 0; i < users.length; i++) {
        const userAddress = users[i].address;
        const isMember = await coa.getDaoMember(daoId, userAddress);
        if (isMember.exists) filteredUsers.push(users[i]);
      }
      return await Promise.all(filteredUsers);
    } catch (error) {
      logger.error('[DAOService] :: Error getting DAO Users', error);
      throw new COAError(errors.dao.ErrorGettingDaoUsers(daoId));
    }
  },
  /*
   * Gets the unsigned transaction to process a proposal
   */
  async getProcessProposalTransaction({ daoId, proposalId, userWallet }) {
    logger.info(
      '[DAOService] :: Entering getProcessProposalTransaction method'
    );
    validateRequiredParams({
      method: 'getProcessProposalTransaction',
      params: { daoId, proposalId, userWallet }
    });

    logger.info('[DAOService] :: Getting new process proposal transaction');
    try {
      const unsignedTx = await coa.getProcessProposalTransaction(
        daoId,
        proposalId,
        userWallet.address
      );

      const nonce = await this.transactionService.getNextNonce(
        userWallet.address
      );

      const txWithNonce = { ...unsignedTx, nonce };
      logger.info(
        '[DAOService] :: Sending unsigned transaction to client',
        txWithNonce
      );
      return {
        tx: txWithNonce,
        encryptedWallet: userWallet.encryptedWallet
      };
    } catch (error) {
      logger.error('[DAOService] :: Error processing the proposal', error);
      throw new COAError(errors.dao.ErrorProcessingProposal(proposalId, daoId));
    }
  },
  /*
   * Sends the signed transaction to the blockchain
   */
  async sendProcessProposalTransaction({
    daoId,
    proposalId,
    signedTransaction,
    userWallet
  }) {
    logger.info(
      '[DAOService] :: Entering sendProcessProposalTransaction method'
    );
    validateRequiredParams({
      method: 'sendProcessProposalTransaction',
      params: {
        daoId,
        signedTransaction,
        userWallet
      }
    });

    const userAddress = userWallet.address;
    logger.info(
      '[DAOService] :: Sending signed tx to the blockchain for process proposal of DAO: ',
      daoId
    );

    const tx = await coa.sendNewTransaction(signedTransaction);
    logger.info('[DAOService] :: Process proposal transaction sent', tx);

    logger.info('[DAOService] :: Saving transaction in database', tx);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return proposalId;
  },
  async getNewProposalTransaction({
    daoId,
    userWallet,
    applicant,
    description,
    type
  }) {
    logger.info('[DAOService] :: Entering getNewProposalTransaction method');
    validateRequiredParams({
      method: 'getNewProposalTransaction',
      params: { daoId, userWallet, applicant, description, type }
    });

    if (!Object.values(proposalTypeEnum).includes(type)) {
      logger.error(
        `[DAOService] :: Proposal type of value ${type} is not valid`
      );
      throw new COAError(errors.dao.InvalidProposalType);
    }

    logger.info('[DAOService] :: Getting new proposal transaction');
    const unsignedTx = await coa.getNewProposalTransaction(
      daoId,
      applicant,
      type,
      description,
      userWallet.address
    );

    const nonce = await this.transactionService.getNextNonce(
      userWallet.address
    );
    const txWithNonce = { ...unsignedTx, nonce };

    logger.info(
      '[DAOService] :: Sending unsigned transaction to client',
      txWithNonce
    );
    return {
      tx: txWithNonce,
      encryptedWallet: userWallet.encryptedWallet
    };
  },
  /*
   * Sends the signed transaction to the blockchain
   */
  async sendNewProposalTransaction({
    daoId,
    applicant,
    description,
    type,
    signedTransaction,
    userWallet
  }) {
    logger.info('[DAOService] :: Entering sendNewProposalTransaction method');
    validateRequiredParams({
      method: 'sendNewProposalTransaction',
      params: {
        daoId,
        applicant,
        description,
        type,
        signedTransaction,
        userWallet
      }
    });

    const userAddress = userWallet.address;
    logger.info(
      '[DAOService] :: Sending signed tx to the blockchain for proposal of DAO: ',
      daoId
    );

    const tx = await coa.sendNewTransaction(signedTransaction);
    logger.info('[DAOService] :: New proposal transaction sent', tx);

    // Saving the tx on the DB
    const proposal = {
      daoId,
      applicant,
      proposer: userAddress,
      description,
      type,
      txHash: tx.hash,
      status: txProposalStatus.SENT
    };

    logger.info('[DAOService] :: Saving proposal in database', proposal);
    await this.proposalDao.addProposal(proposal);

    logger.info('[DAOService] :: Saving transaction in database', tx);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return daoId;
  },
  /*
   * Gets the unsigned transaction of a vote
   */
  async getNewVoteTransaction({ daoId, proposalId, userWallet, vote }) {
    logger.info('[DAOService] :: Entering getNewVoteTransaction method');
    validateRequiredParams({
      method: 'getNewVoteTransaction',
      params: { daoId, proposalId, userWallet, vote }
    });

    let userVote = voteEnum.NULL;
    if (vote !== null && vote !== undefined) {
      userVote = vote ? voteEnum.YES : voteEnum.NO;
    }

    logger.info('[DAOService] :: Getting new vote transaction');
    try {
      const unsignedTx = await coa.getNewVoteTransaction(
        daoId,
        proposalId,
        userVote,
        userWallet.address
      );

      const nonce = await this.transactionService.getNextNonce(
        userWallet.address
      );
      const txWithNonce = { ...unsignedTx, nonce };
      logger.info(
        '[DAOService] :: Sending unsigned transaction to client',
        txWithNonce
      );
      return {
        tx: txWithNonce,
        encryptedWallet: userWallet.encryptedWallet
      };
    } catch (error) {
      logger.error('[DAOService] :: Error voting proposal', error);
      throw new COAError(errors.dao.ErrorVotingProposal(proposalId, daoId));
    }
  },
  async sendNewVoteTransaction({
    daoId,
    proposalId,
    vote,
    signedTransaction,
    userWallet
  }) {
    logger.info('[DAOService] :: Entering sendNewVoteTransaction method');
    validateRequiredParams({
      method: 'sendNewVoteTransaction',
      params: {
        daoId,
        proposalId,
        vote,
        signedTransaction,
        userWallet
      }
    });

    const userAddress = userWallet.address;
    logger.info(
      '[DAOService] :: Sending signed tx to the blockchain for vote of DAO: ',
      daoId,
      'Proposal: ',
      proposalId
    );

    const tx = await coa.sendNewTransaction(signedTransaction);
    logger.info('[DAOService] :: New vote transaction sent', tx);

    // Saving the tx on the DB
    const newVote = {
      daoId,
      proposalId,
      vote,
      voter: userAddress,
      txHash: tx.hash,
      status: txProposalStatus.SENT
    };

    logger.info('[DAOService] :: Saving vote in database', newVote);
    await this.voteDao.addVote(newVote);

    logger.info('[DAOService] :: Saving transaction in database', tx);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return daoId;
  },
  async voteProposal({ daoId, proposalId, vote, user }) {
    logger.info('[DAOService] :: Entering voteProposal method');
    validateRequiredParams({
      method: 'voteProposal',
      params: { daoId, proposalId, user, vote }
    });

    // TODO: check if user is allowed to vote?
    let userVote = voteEnum.NULL;
    if (vote !== null && vote !== undefined) {
      userVote = vote ? voteEnum.YES : voteEnum.NO;
    }

    logger.info('[DAOService] :: Voting for proposal', {
      daoId,
      proposalId,
      vote: userVote,
      userId: user.id
    });

    try {
      await coa.submitProposalVote(daoId, proposalId, userVote, undefined);
      // await coa.submitProposalVote(daoId, proposalId, userVote, user.wallet.address);
      // Temporally this will stay commented until signer
      // is implemented on this service: user.wallet.address
    } catch (error) {
      logger.error('[DAOService] :: Error voting proposal', error);
      throw new COAError(errors.dao.ErrorVotingProposal(proposalId, daoId));
    }
    return { proposalId };
  },
  async submitProposal({ daoId, type, description, applicant, user }) {
    logger.info('[DAOService] :: Entering submitProposal method');
    validateRequiredParams({
      method: 'submitProposal',
      params: { daoId, type, description, applicant, user }
    });
    if (!Object.values(proposalTypeEnum).includes(type)) {
      logger.error(
        `[DAOService] :: Proposal type of value ${type} is not valid`
      );
      throw new COAError(errors.dao.InvalidProposalType);
    }

    // TODO: check if user is allowed to submit?
    logger.info('[DAOService] :: Submitting proposal', {
      daoId,
      applicant,
      type,
      description,
      userId: user.id
    });
    try {
      await coa.submitProposal(
        daoId,
        type,
        description,
        applicant,
        undefined
        // user.wallet.address
        // Temporally this will stay commented until signer
        // is implemented on this service.
      );
    } catch (error) {
      logger.error('[DAOService] :: Error submitting proposal', error);
      throw new COAError(errors.dao.ErrorSubmittingProposal(daoId));
    }
    return { daoId };
  },
  async processProposal({ daoId, proposalId, user }) {
    logger.info('[DAOService] :: Entering processProposal method');
    validateRequiredParams({
      method: 'processProposal',
      params: { daoId, proposalId, user }
    });
    // TODO: check if user is allowed to process?
    logger.info('[DAOService] :: Processing proposal', {
      daoId,
      proposalId,
      userId: user.id
    });
    try {
      await coa.processProposal(daoId, proposalId, user.wallet);
    } catch (error) {
      logger.error('[DAOService] :: Error processing proposal', error);
      throw new COAError(errors.dao.ErrorProcessingProposal(proposalId, daoId));
    }
    return { proposalId };
  },
  async getProposalsByDaoId({ daoId, user }) {
    logger.info('[DAOService] :: Entering getAllProposalsByDaoId method');
    validateRequiredParams({
      method: 'getProposalsByDaoId',
      params: { daoId }
    });
    logger.info('[DAOService] :: Getting all proposals', {
      daoId
    });
    try {
      const signer = user.wallet.address;
      const notConfirmedProposals = await this.getSentProposals(daoId);
      const notConfirmedFields = notConfirmedProposals.map(
        ({ proposer, applicant, description }) => ({
          proposer,
          applicant,
          description
        })
      );
      const confirmedProposals = await coa.getAllProposalsByDaoId(daoId);
      const formattedProposals = await this.formatProposals(
        daoId,
        confirmedProposals,
        signer
      );
      /* eslint-disable array-callback-return */
      return formattedProposals.map(proposal => {
        const { proposer, applicant, description } = proposal;
        if (
          !notConfirmedFields.includes({
            proposer,
            applicant,
            description
          })
        ) {
          return proposal;
        }
      });
    } catch (error) {
      logger.error('[DAOService] :: Error getting proposals', error);
      throw new COAError(errors.dao.ErrorGettingProposals(daoId));
    }
  },
  async getMember({ daoId, memberAddress, user }) {
    logger.info('[DAOService] :: Entering getMember method');
    validateRequiredParams({
      method: 'getMember',
      params: { daoId, memberAddress, user }
    });
    logger.info('[DAOService] :: Getting member', {
      daoId,
      memberAddress,
      userId: user.id
    });
    try {
      const member = await coa.getDaoMember(daoId, memberAddress, user.wallet);
      if (!member || !member.exists) {
        logger.error(
          `[DAOService] :: Member of address ${memberAddress} in DAO ${daoId} not found`
        );
        throw new COAError(errors.dao.MemberNotFound(memberAddress, daoId));
      }
      return {
        role: daoMemberRoleNames[member.role],
        exists: member.exists,
        shares: Number(member.shares)
      };
    } catch (error) {
      logger.error('[DAOService] :: Error getting member', error);
      if (error instanceof COAError) throw error;
      throw new COAError(errors.dao.ErrorGettingMember(memberAddress, daoId));
    }
  },
  async getDaos({ user }) {
    logger.info('[DAOService] :: Entering getDaos method');
    validateRequiredParams({
      method: 'getDaos',
      params: { user }
    });
    logger.info('[DAOService] :: Getting all DAOS', {
      userId: user.id
    });
    try {
      const daos = await coa.getDaos();
      const filteredDaos = [];
      const userAddress = user.wallet.address;

      // FIXME: when getMembers() is implemented, change this for
      for (let i = 0; i < daos.length; i++) {
        daos[i].id = i;
        const isMember = await coa.getDaoMember(i, userAddress);
        if (isMember.exists) filteredDaos.push(daos[i]);
      }
      const formattedDaos = filteredDaos.map(async dao => ({
        name: await dao.name(),
        address: await dao.address,
        proposalsAmount: await dao.getProposalQueueLength(),
        proposalsOpen: await coa.getOpenProposalsFromDao(dao.id, userAddress),
        id: dao.id
        // TODO: add dao.getMembers() in COA plugin
      }));
      return await Promise.all(formattedDaos);
    } catch (error) {
      logger.error('[DAOService] :: Error getting Daos', error);
      throw new COAError(errors.dao.ErrorGettingDaos());
    }
  },
  async getSentProposals(daoId) {
    logger.info('[DAOService] :: Entering getSentProposals method');
    validateRequiredParams({
      method: 'getSentProposals',
      params: { daoId }
    });

    const proposals = await this.proposalDao.findAllSentTxsByDaoId(daoId);
    if (!proposals) {
      logger.error(
        `[DAOService] :: Proposals with daoId ${daoId} could not be found`
      );
      throw new COAError(errors.dao.ErrorGettingDaos());
    }
    return proposals;
  },
  async formatProposals(daoId, proposals, signer) {
    logger.info('[DAOService] :: Entering formatProposals method');
    validateRequiredParams({
      method: 'formatProposals',
      params: { proposals, signer, daoId }
    });
    const daoCurrentPeriod = await coa.getCurrentPeriod(daoId, signer);
    const daoCreationTime = await coa.getCreationTime(daoId, signer);
    const {
      periodDuration,
      votingPeriodLength,
      gracePeriodLength,
      processingPeriodLength
    } = await coa.getDaoPeriodLengths(daoId, signer);

    const formattedProposals = proposals.map(async (proposal, index) => {
      const voterAddresses = await this.voteDao.findByDaoAndProposalId(
        daoId,
        index
      );
      return {
        proposalType:
          proposal.status !== txProposalStatus.SENT
            ? proposal.proposalType
            : proposal.type,
        proposer: proposal.proposer,
        applicant: proposal.applicant,
        description: proposal.description,
        yesVotes: proposal.yesVotes ? Number(proposal.yesVotes) : 0,
        noVotes: proposal.noVotes ? Number(proposal.noVotes) : 0,
        didPass: proposal.didPass,
        processed: proposal.processed,
        daoCreationTime: Number(daoCreationTime),
        startingPeriod: proposal.startingPeriod
          ? Number(proposal.startingPeriod)
          : 0,
        currentPeriod: Number(daoCurrentPeriod),
        periodDuration: Number(periodDuration),
        votingPeriodLength: Number(votingPeriodLength),
        gracePeriodLength: Number(gracePeriodLength),
        processingPeriodLength: Number(processingPeriodLength),
        votingPeriodExpired:
          proposal.status !== txProposalStatus.SENT
            ? await coa.votingPeriodExpired(daoId, index)
            : null,
        txStatus: proposal.status
          ? proposal.status
          : txProposalStatus.CONFIRMED,
        voters: proposal.status ? [] : voterAddresses,
        voterNames: proposal.status
          ? []
          : await this.userService.getVotersByAddresses(voterAddresses),
        id: proposal.status ? null : index
      };
    });

    return Promise.all(formattedProposals);
  },
  async updateFailedProposalTransactions() {
    logger.info(
      '[DAOService] :: Entering updateFailedProposalTransactions method'
    );
    const sentTxs = await this.proposalDao.findAllSentTxs();
    logger.info(`[DAOService] :: Found ${sentTxs.length} sent transactions`);
    const updated = await Promise.all(
      sentTxs.map(async ({ txHash }) => {
        const hasFailed = await this.transactionService.hasFailed(txHash);
        if (hasFailed) {
          try {
            const { proposalId } = await this.updateProposalByTxHash(
              txHash,
              txProposalStatus.FAILED,
              null
            );
            return proposalId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              "[DAOService] :: Couldn't update failed transaction status",
              txHash
            );
          }
        }
      })
    );
    const failed = updated.filter(tx => !!tx);
    if (failed.length > 0) {
      logger.info(
        `[DAOService] :: Updated status to ${
          txProposalStatus.FAILED
        } for proposals ${failed}`
      );
    } else {
      logger.info('[DAOService] :: No failed transactions found');
    }
    return failed;
  },
  async updateProposalByTxHash(txHash, status, proposalId) {
    logger.info('[DAOService] :: Entering updateProposalByTxHash method');
    validateRequiredParams({
      method: 'updateProposalByTxHash',
      params: { txHash, status, proposalId }
    });

    const proposal = await this.proposalDao.findByTxHash(txHash);
    if (!proposal) {
      logger.error(
        `[DAOService] :: Proposal with txHash ${txHash} could not be found`
      );
      throw new COAError(
        errors.common.CantFindModelWithTxHash('proposal', txHash)
      );
    }

    if (!Object.values(txProposalStatus).includes(status)) {
      logger.error(`[DAOService] :: Proposal status '${status}' is not valid`);
      throw new COAError(errors.dao.ProposalStatusNotValid(status));
    }

    if (
      [txProposalStatus.CONFIRMED, txProposalStatus.FAILED].includes(
        proposal.status
      )
    ) {
      logger.error('[DAOService] :: Proposal status cannot be changed', {
        id: proposal.id,
        status: proposal.status
      });
      throw new COAError(
        errors.dao.ProposalStatusCannotChange(proposal.status)
      );
    }

    logger.info(
      `[DAOService] :: Updating Proposal to status ${status} and id ${proposalId}`
    );
    const updated = await this.proposalDao.updateProposalByTxHash(txHash, {
      proposalId,
      status
    });
    return { proposalId: updated.proposalId };
  },
  async updateFailedVoteTransactions() {
    logger.info('[DAOService] :: Entering updateFailedVoteTransactions method');
    const sentTxs = await this.voteDao.findAllSentTxs();
    logger.info(`[DAOService] :: Found ${sentTxs.length} sent transactions`);
    const updated = await Promise.all(
      sentTxs.map(async ({ txHash }) => {
        const hasFailed = await this.transactionService.hasFailed(txHash);
        if (hasFailed) {
          try {
            const { proposalId } = await this.updateVoteByTxHash(
              txHash,
              txProposalStatus.FAILED
            );
            return proposalId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              "[DAOService] :: Couldn't update failed transaction status",
              txHash
            );
          }
        }
      })
    );
    const failed = updated.filter(tx => !!tx);
    if (failed.length > 0) {
      logger.info(
        `[DAOService] :: Updated status to ${
          txProposalStatus.FAILED
        } for proposals ${failed}`
      );
    } else {
      logger.info('[DAOService] :: No failed transactions found');
    }
    return failed;
  },
  async updateVoteByTxHash(txHash, status) {
    logger.info('[DAOService] :: Entering updateVoteByTxHash method');
    validateRequiredParams({
      method: 'updateVoteByTxHash',
      params: { txHash, status }
    });

    const vote = await this.voteDao.findByTxHash(txHash);
    if (!vote) {
      logger.error(
        `[DAOService] :: Vote with txHash ${txHash} could not be found`
      );
      throw new COAError(errors.common.CantFindModelWithTxHash('vote', txHash));
    }

    if (!Object.values(txProposalStatus).includes(status)) {
      logger.error(`[DAOService] :: Vote status '${status}' is not valid`);
      throw new COAError(errors.dao.VoteStatusNotValid(status));
    }

    if (
      [txProposalStatus.CONFIRMED, txProposalStatus.FAILED].includes(
        vote.status
      )
    ) {
      logger.error('[DAOService] :: Vote status cannot be changed', {
        id: vote.id,
        status: vote.status
      });
      throw new COAError(errors.dao.VoteStatusCannotChange(vote.status));
    }

    logger.info(`[DAOService] :: Updating Vote to status ${status}`);
    const updated = await this.voteDao.updateVoteByTxHash(txHash, {
      status
    });
    return { proposalId: updated.proposalId };
  }
};
