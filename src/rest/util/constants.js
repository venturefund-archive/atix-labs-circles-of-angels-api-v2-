/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const txTypes = {
  SENT: 'sent',
  RECEIVED: 'received'
};

const txStatusType = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};

const currencyType = {
  FIAT: 'fiat',
  CRYPTO: 'crypto'
};

const evidenceTypes = {
  TRANSFER: 'transfer',
  IMPACT: 'impact'
};

const evidenceStatus = {
  NEW: 'new',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const lastEvidenceStatus = [evidenceStatus.APPROVED, evidenceStatus.REJECTED];

const validStatusToChange = [evidenceStatus.APPROVED, evidenceStatus.REJECTED];

const projectSections = {
  BASIC_INFORMATION: 1,
  DETAILS: 2,
  USERS: 3,
  MILESTONES: 4
};

const rolesTypes = {
  BENEFICIARY: 'beneficiary',
  AUDITOR: 'auditor',
  FUNDER: 'funder'
};

const projectSensitiveDataFields = [];

const projectPublicFields = [
  'status',
  'basicInformation',
  'details',
  'milestones',
  'users',
  'budget',
  'inReview',
  'revision'
];

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
  DRAFT: 'draft',
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

const newProjectStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in progress',
  IN_REVIEW: 'in review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  OPEN_REVIEW: 'open review',
  CANCELLED_REVIEW: 'cancelled review'
};

const projectStatuses = {
  ...privateProjectStatuses,
  ...publicProjectStatuses,
  ...inactiveProjectStatuses,
  ...newProjectStatus
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

const currencyTypes = {
  FIAT: 'fiat',
  CRYPTO: 'crypto'
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

const allowDeleteProjectStatuses = [projectStatuses.DRAFT];

const ACTIVITY_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'to-review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const ACTIVITY_STATUS_TRANSITION = {
  [ACTIVITY_STATUS.NEW]: [],
  [ACTIVITY_STATUS.IN_PROGRESS]: [ACTIVITY_STATUS.IN_REVIEW],
  [ACTIVITY_STATUS.IN_REVIEW]: [
    ACTIVITY_STATUS.REJECTED,
    ACTIVITY_STATUS.APPROVED
  ],
  [ACTIVITY_STATUS.APPROVED]: [ACTIVITY_STATUS.IN_REVIEW],
  [ACTIVITY_STATUS.REJECTED]: [ACTIVITY_STATUS.IN_REVIEW]
};

const MILESTONE_STATUS = {
  NOT_STARTED: 'not started',
  IN_PROGRESS: 'in progress',
  APPROVED: 'approved'
};

const decimalBase = 10;

const TIMEFRAME_DECIMALS = 3;

const ACTION_TYPE = {
  CREATE_PROJECT: 'create_project',
  PUBLISH_PROJECT: 'publish_project',
  SEND_PROJECT_TO_REVIEW: 'send_project_to_review',
  EDIT_PROJECT_BASIC_INFORMATION: 'edit_project_basic_information',
  EDIT_PROJECT_DETAILS: 'edit_project_details',
  ADD_USER_PROJECT: 'add_user_project',
  REMOVE_USER_PROJECT: 'remove_user_project',
  ADD_MILESTONE: 'add_milestone',
  REMOVE_MILESTONE: 'remove_milestone',
  ADD_ACTIVITY: 'add_activity',
  REMOVE_ACTIVITY: 'remove_activity',
  ADD_EVIDENCE: 'add_evidence',
  REJECT_ACTIVITY: 'reject_activity',
  APPROVE_ACTIVITY: 'approve_activity',
  SEND_ACTIVITY_TO_REVIEW: 'activity_to_review',
  REJECT_EVIDENCE: 'reject_evidence',
  APPROVE_EVIDENCE: 'approve_evidence',
  PROJECT_CLONE: 'project_clone',
  CANCEL_REVIEW: 'cancel_review',
  APPROVE_REVIEW: 'approve_review'
};

const projectStatusToClone = [
  projectStatuses.IN_PROGRESS,
  projectStatuses.PUBLISHED
];

const EDITABLE_ACTIVITY_STATUS = [
  ACTIVITY_STATUS.IN_PROGRESS,
  ACTIVITY_STATUS.NEW
];

module.exports = {
  ACTION_TYPE,
  ACTIVITY_STATUS,
  ACTIVITY_STATUS_TRANSITION,
  MILESTONE_STATUS,
  allowDeleteProjectStatuses,
  decimalBase,
  currencyTypes,
  lastEvidenceStatus,
  projectPublicFields,
  projectSensitiveDataFields,
  evidenceFileTypes,
  txFunderStatus,
  transferStatus,
  projectStatus,
  projectStatuses,
  publicProjectStatuses,
  privateProjectStatuses,
  projectSections,
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
  projectStatusesWithUpdateTime,
  rolesTypes,
  currencyType,
  evidenceTypes,
  evidenceStatus,
  validStatusToChange,
  txStatusType,
  txTypes,
  TIMEFRAME_DECIMALS,
  projectStatusToClone,
  EDITABLE_ACTIVITY_STATUS,
  TIMEFRAME_DECIMALS
};
