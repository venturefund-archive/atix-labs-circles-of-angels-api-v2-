/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const configs = require('config');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();

const {
  projectStatus,
  blockchainStatus,
  userRoles,
  activityStatus
} = require('../rest/util/constants');

const userAdminId = 1;
const userSeId = 2;
const userFunderId = 3;
const userOracleId = 4;
const genericUserId = userOracleId;

exports.genericUser = userEmail => ({
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: userEmail,
  id: genericUserId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  role: userRoles.ORACLE,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Social Entrepreneur Rejected'
});

exports.userOracle = {
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'oracle@test.com',
  id: userOracleId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  blocked: false,
  role: userRoles.ORACLE,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Oracle 1',
  transferBlockchainStatus: blockchainStatus.CONFIRMED
};

exports.userSE = {
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'user@test.com',
  id: userSeId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  blocked: false,
  role: userRoles.SOCIAL_ENTREPRENEUR,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'SE 1',
  transferBlockchainStatus: blockchainStatus.CONFIRMED
};

exports.blockedUser = {
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'user@blocked.com',
  id: userSeId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  blocked: false,
  role: userRoles.SOCIAL_ENTREPRENEUR,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'SE 1',
  transferBlockchainStatus: blockchainStatus.CONFIRMED
};

exports.userAdmin = {
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'admin@test.com',
  id: userAdminId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  blocked: false,
  role: userRoles.BO_ADMIN,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Admin',
  transferBlockchainStatus: blockchainStatus.CONFIRMED
};

exports.userFunder = {
  address: ethServicesMock.createAccount().address,
  privKey: ethServicesMock.createAccount().privateKey,
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'funder@test.com',
  id: userFunderId,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  blocked: false,
  role: userRoles.IMPACT_FUNDER,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Funder 1',
  transferBlockchainStatus: blockchainStatus.CONFIRMED
};

exports.userSeAnswers = userId => ({
  answers: [
    {
      customAnswer: '',
      id: 2,
      question: {
        question: 'Type of funding you are seeking:',
        role: userRoles.SOCIAL_ENTREPRENEUR,
        answerLimit: 1,
        id: 3
      },
      answer: {
        answer: 'Debt Financing',
        id: 26,
        question: 3
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 3,
      question: {
        question:
          'Which are the areas of impact that you tackle based on the UN Sustainable Development Goals?',
        role: userRoles.SOCIAL_ENTREPRENEUR,
        answerLimit: 3,
        id: 4
      },
      answer: {
        answer: 'Gender Equality',
        id: 35,
        question: 4
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 4,
      question: {
        question:
          'Which are the areas of impact that you tackle based on the UN Sustainable Development Goals?',
        role: userRoles.SOCIAL_ENTREPRENEUR,
        answerLimit: 3,
        id: 4
      },
      answer: {
        answer: 'Zero Hunger',
        id: 32,
        question: 4
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 5,
      question: {
        question:
          'Which are the areas of impact that you tackle based on the UN Sustainable Development Goals?',
        role: userRoles.SOCIAL_ENTREPRENEUR,
        answerLimit: 3,
        id: 4
      },
      answer: {
        answer: 'Clean Water and Sanitation',
        id: 36,
        question: 4
      },
      user: userId
    }
  ]
});

exports.userSeDetails = userId => ({
  detail: {
    id: 5,
    company: 'company',
    phoneNumber: '666777',
    user: userId
  }
});

exports.userFunderAnswers = userId => ({
  answers: [
    {
      customAnswer: '',
      id: 6,
      question: {
        question:
          'How often do you or your firm make angel impact investments?',
        role: userRoles.IMPACT_FUNDER,
        answerLimit: 1,
        id: 1
      },
      answer: {
        answer: '1 to 3 investments in the last 12 months',
        id: 3,
        question: 1
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 7,
      question: {
        question:
          'Are you currently an advocate/ volunteer or donor for a social cause? If yes, what are the top 3 impact areas you focus on? Please select up to 3 UN Sustainable Development Goals',
        role: userRoles.IMPACT_FUNDER,
        answerLimit: 3,
        id: 2
      },
      answer: {
        answer: 'Gender Equality',
        id: 12,
        question: 2
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 8,
      question: {
        question:
          'Are you currently an advocate/ volunteer or donor for a social cause? If yes, what are the top 3 impact areas you focus on? Please select up to 3 UN Sustainable Development Goals',
        role: userRoles.IMPACT_FUNDER,
        answerLimit: 3,
        id: 2
      },
      answer: {
        answer: 'Peace and Justice Strong Institutions',
        id: 23,
        question: 2
      },
      user: userId
    },
    {
      customAnswer: '',
      id: 9,
      question: {
        question:
          'Are you currently an advocate/ volunteer or donor for a social cause? If yes, what are the top 3 impact areas you focus on? Please select up to 3 UN Sustainable Development Goals',
        role: userRoles.IMPACT_FUNDER,
        answerLimit: 3,
        id: 2
      },
      answer: {
        answer: 'Life Below Water',
        id: 21,
        question: 2
      },
      user: userId
    }
  ]
});

exports.userFunderDetails = userId => ({
  detail: {
    id: 1,
    phoneNumber: '4136394',
    user: userId
  }
});

exports.activity = {
  blockchainStatus: blockchainStatus.CONFIRMED,
  budget: '1',
  category: 'Salary',
  createdAt: '2019-05-31T03:00:00.000Z',
  id: 1,
  impact: 'Increased capacity of outreach to students and process contracts',
  impactCriterion: 'Contract signed and person start working with us',
  keyPersonnel: 'COO, CEO, Investment in Education (IE) Manager ',
  milestone: 1,
  oracle: { ...this.userOracle },
  quarter: 'Quarter 1',
  signsOfSuccess: 'New team member joins the team',
  signsOfSuccessCriterion: 'Contract signed with new team member',
  status: activityStatus.PENDING,
  tasks: 'Hire a FISA officer in Cambodia (or Thailand)',
  transactionHash: '',
  type: 'Activity',
  updatedAt: '2019-05-31T03:00:00.000Z'
};

exports.milestone = {
  activities: [],
  blockchainStatus: blockchainStatus.CONFIRMED,
  budget: '1200',
  budgetStatus: { id: 1, name: 'Claimable' },
  category: 'Marketing costs and salaries',
  createdAt: '2019-05-31T03:00:00.000Z',
  id: 1,
  impact: 'Increased capacity of outreach to students and process contracts',
  impactCriterion: 'Contract signed and person start working with us',
  keyPersonnel: 'Newly hired IE team member',
  project: 1,
  quarter: 'Quarter 1',
  signsOfSuccess: 'Attendance and/or reach of event',
  signsOfSuccessCriterion:
    'Pictures of event, sign up sheets or other evidence when applicable',
  status: { status: 1, name: 'Pending' },
  tasks: 'Operations: Expand marketing capacity in Cambodia (or Thailand)',
  transactionHash: '',
  type: 'Milestone',
  updatedAt: '2019-05-31T03:00:00.000Z'
};

const projectId = 11;

exports.project = {
  blockchainStatus: blockchainStatus.CONFIRMED,
  startBlockchainStatus: blockchainStatus.PENDING,
  cardPhoto: 2,
  coverPhoto: 1,
  createdAt: '2019-05-31T03:00:00.000Z',
  creationTransactionHash: ethServicesMock.createProject(),
  faqLink: 'http://www.google.com/',
  goalAmount: 9000,
  id: projectId,
  location: 'Location',
  milestones: [],
  milestonesFile: `${
    configs.fileServer.filePath
  }/projects/${projectId}/milestones.xlsx`,
  mission: 'Project Mission',
  ownerEmail: 'user@test.com',
  ownerId: 2,
  ownerName: 'Patrick Steward',
  pitchProposal: `${
    configs.fileServer.filePath
  }/projects/${projectId}/pitchProposal.pdf`,
  problemAddressed: 'Problem',
  projectAgreement: `${
    configs.fileServer.filePath
  }/projects/${projectId}/agreement.pdf`,
  projectName: 'nuevo',
  status: projectStatus.PUBLISHED,
  timeframe: 'Project Timeframe',
  transactionHash: ethServicesMock.createProject(),
  updatedAt: '2019-05-31T03:00:00.000Z'
};

exports.userProject = {
  id: 20,
  user: userFunderId,
  project: projectId,
  status: 1
};

exports.photos = [
  { id: 1, path: `${configs.fileServer.filePath}/projectCoverPhoto.png` },
  { id: 2, path: `${configs.fileServer.filePath}/projectCardPhoto.png` }
];

exports.passRecovery = {
  id: 1,
  email: 'dummy@email.com',
  token: '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
  createdAt: new Date()
};

exports.passRecoveryWithExpiredToken = {
  id: 2,
  email: 'invalid@email.com',
  token: '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
  createdAt: '1900-04-16T03:00:00.000Z'
};
exports.passRecoveryUserWithoutEmail = {
  id: 2,
  token: '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
  createdAt: '1900-04-16T03:00:00.000Z'
};
