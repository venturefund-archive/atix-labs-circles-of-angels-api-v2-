/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const evidenceFileTypes = {
  FILE: 'File',
  PHOTO: 'Photo'
};

const transferStatus = {
  RECONCILIATION: 1,
  PENDING_VERIFICATION: 0,
  CANCELLED: 3,
  VERIFIED: 2
};

const projectStatus = {
  // TODO delete this one
  REJECTED: 2,
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  PUBLISHED: 3,
  IN_PROGRESS: 4
};

const publicProjectStatuses = {
  PUBLISHED: 'published',
  CONSENSUS: 'consensus',
  FUNDING: 'funding',
  EXECUTING: 'executing',
  CHANGING_SCOPE: 'changingscope',
  FINISHED: 'finished',
  ABORTED: 'aborted'
};

const privateProjectStatuses = {
  NEW: 'new',
  TO_REVIEW: 'toreview',
  REJECTED: 'rejected'
};

const inactiveProjectStatuses = {
  DELETED: 'deleted',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled'
  // TODO this status might be a boolean field in project table
  // SUSPENDED: 'suspended'
};

const projectStatusesWithUpdateTime = {
  CONSENSUS: 'consensus',
  FUNDING: 'funding'
};

const projectStatuses = {
  ...privateProjectStatuses,
  ...publicProjectStatuses,
  ...inactiveProjectStatuses
};

const activityStatus = {
  PENDING: 1,
  STARTED: 2,
  VERIFIED: 3,
  COMPLETED: 4
};

const txFunderStatus = {
  PENDING: 'pending',
  RECONCILIATION: 'reconciliation',
  CANCELLED: 'cancelled',
  VERIFIED: 'verified',
  SENT: 'sent',
  FAILED: 'failed',
  PENDING_VERIFICATION: 'pending_verification'
};

const claimMilestoneStatus = {
  PENDING: 'pending',
  CLAIMABLE: 'claimable',
  CLAIMED: 'claimed',
  TRANSFERRED: 'transferred'
};

const userRoles = {
  COA_ADMIN: 'admin',
  ENTREPRENEUR: 'entrepreneur',
  PROJECT_SUPPORTER: 'supporter',
  PROJECT_CURATOR: 'curator',
  BANK_OPERATOR: 'bankoperator'
};

const supporterRoles = {
  ORACLES: 'oracles',
  FUNDERS: 'funders'
};

const milestoneBudgetStatus = {
  CLAIMABLE: 1,
  CLAIMED: 2,
  FUNDED: 3,
  BLOCKED: 4
};

const blockchainStatus = {
  PENDING: 1,
  SENT: 2,
  CONFIRMED: 3,
  ABORTED: 4
};

const xlsxConfigs = {
  keysMap: {
    A: 'quarter',
    C: 'tasks',
    D: 'impact',
    E: 'impactCriterion',
    F: 'signsOfSuccess',
    G: 'signsOfSuccessCriterion',
    H: 'budget',
    I: 'category',
    J: 'keyPersonnel'
  },
  columnNames: {
    quarter: 'Timeline',
    tasks: 'Tasks',
    impact: 'Expected Changes/ Social Impact Targets',
    impactCriterion: 'Review Criterion for the Expected Changes',
    signsOfSuccess: 'Signs of Success',
    signsOfSuccessCriterion: 'Review Criterion for the Signs of Success',
    budget: 'Budget needed',
    category: 'Expenditure Category',
    keyPersonnel: 'Key Personnel Responsible'
  },
  typeColumnKey: 'B',
  startRow: 4
};

const transactionTypes = {
  projectCreation: 'projectCreation',
  milestoneCreation: 'milestoneCreation',
  activityCreation: 'activityCreation',
  milestoneClaimed: 'milestoneClaimed',
  projectStarted: 'projectStarted',
  milestoneFunded: 'milestoneFunded',
  validateActivity: 'validateActivity',
  updateEvidence: 'updateEvidence'
};

const voteEnum = {
  NULL: 0,
  YES: 1,
  NO: 2
};
const proposalTypeEnum = {
  NEW_MEMBER: 0,
  NEW_DAO: 1,
  ASSIGN_BANK: 2,
  ASSIGN_CURATOR: 3
};
const daoMemberRoleEnum = {
  NORMAL: 0,
  BANK: 1,
  CURATOR: 2
};
const daoMemberRoleNames = ['Normal', 'Bank Operator', 'Project Curator'];

const txEvidenceStatus = {
  NOT_SENT: 'notsent',
  SENT: 'sent',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  PENDING_VERIFICATION: 'pending_verification'
};

const txProposalStatus = {
  NOT_SENT: 'notsent',
  SENT: 'sent',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

const encryption = {
  saltOrRounds: 10
};

module.exports = {
  evidenceFileTypes,
  txFunderStatus,
  transferStatus,
  projectStatus,
  projectStatuses,
  publicProjectStatuses,
  privateProjectStatuses,
  inactiveProjectStatuses,
  activityStatus,
  userRoles,
  supporterRoles,
  milestoneBudgetStatus,
  blockchainStatus,
  xlsxConfigs,
  transactionTypes,
  voteEnum,
  proposalTypeEnum,
  daoMemberRoleNames,
  daoMemberRoleEnum,
  claimMilestoneStatus,
  txEvidenceStatus,
  txProposalStatus,
  encryption,
  projectStatusesWithUpdateTime
};
