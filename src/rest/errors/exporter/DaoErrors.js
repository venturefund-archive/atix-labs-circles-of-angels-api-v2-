module.exports = {
  ErrorSubmittingProposal: daoId => ({
    message: `An error has occurred while submitting the proposal to DAO ${daoId}`
  }),
  ErrorVotingProposal: (proposalId, daoId) => ({
    message: `An error has occurred while voting the proposal ${proposalId} of DAO ${daoId}`
  }),
  ErrorProcessingProposal: (proposalId, daoId) => ({
    message: `An error has occurred while processing the proposal ${proposalId} of DAO ${daoId}`
  }),
  ErrorGettingProposals: daoId => ({
    message: `An error has occurred while getting the proposals of ${daoId}`
  }),
  ErrorGettingDaos: () => ({
    message: 'An error has occurred while getting the Daos'
  }),
  ErrorGettingDaoUsers: daoId => ({
    message: `An error has occurred while getting the Users of DAO ${daoId}`
  }),
  ErrorGettingMember: (address, daoId) => ({
    message: `An error has occurred while getting the member of address ${address} in DAO ${daoId}`
  }),
  MemberNotFound: (address, daoId) => ({
    message: `Member of address ${address} in DAO ${daoId} not found`,
    statusCode: 403
  }),
  InvalidProposalType: () => ({
    message: 'Proposal type is not valid',
    statusCode: 403
  }),
  ProposalStatusNotValid: status => ({
    message: `Proposal status '${status}' is not a valid value`,
    statusCode: 400
  }),
  ProposalStatusCannotChange: status => ({
    message: `Status ${status} of a proposal cannot be updated`,
    statusCode: 400
  }),
  VoteStatusNotValid: status => ({
    message: `Vote status '${status}' is not a valid value`,
    statusCode: 400
  }),
  VoteStatusCannotChange: status => ({
    message: `Status ${status} of a vote cannot be updated`,
    statusCode: 400
  })
};
