/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents a project of Circles Of Angels
 *@attribute `id`: id of the project in the business domain
 *@attribute `projectName`: name with which the user will be shown
 *@attribute `ownerId`: id of the user who is the creator
 *@attribute `mission`: project mission
 *@attribute `problemAddressed`: problem addressed by the project
 *@attribute `location`: geographical location where the project will be developed
 *@attribute `timeframe`: project time duration
 *@attribute `coverPhoto`: project cover image
 *@attribute `cardPhoto`: project icon
 *@attribute `status`: current project status
 *@attribute `goalAmount`: amount of money needed from the project
 *@attribute `faqLink`: link to the FAQ page
 *@attribute `pitchProposal`: initial proposal of the project
 *@attribute `milestonesFile`: excel file of milestones
 *@attribute `projectAgreement`: project consensus file
 */

const config = require('config');
const {
  projectStatuses,
  PROJECT_TYPES
} = require('../../src/rest/util/constants');

module.exports = {
  identity: 'project',
  primaryKey: 'id',
  attributes: {
    projectName: { type: 'string', required: false, allowNull: true },
    mission: { type: 'string', required: false, allowNull: true },
    problemAddressed: { type: 'string', required: false, allowNull: true },
    location: { type: 'string', required: false, allowNull: true },
    timeframe: {
      type: 'ref',
      required: false,
      defaultsTo: 0
    },
    timeframeUnit: { type: 'string', required: false, allowNull: true },
    dataComplete: {
      type: 'number',
      required: false,
      defaultsTo: 0
    },
    proposal: { type: 'string', required: false, allowNull: true },
    faqLink: { type: 'string', required: false, allowNull: true },
    agreementJson: { type: 'string', required: false, allowNull: true },
    coverPhotoPath: { type: 'string', required: false, allowNull: true },
    cardPhotoPath: { type: 'string', required: false, allowNull: true },
    milestonePath: { type: 'string', required: false, allowNull: true },
    proposalFilePath: { type: 'string', required: false, allowNull: true },
    agreementFilePath: { type: 'string', required: false, allowNull: true },
    agreementFileHash: { type: 'string', required: false, allowNull: true },
    proposalFileHash: { type: 'string', required: false, allowNull: true },
    goalAmount: { type: 'string', required: false, defaultsTo: '0' },
    status: { type: 'string', defaultsTo: projectStatuses.DRAFT },
    owner: {
      columnName: 'ownerId',
      model: 'user'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    address: { type: 'string', required: false, allowNull: true },
    milestones: {
      collection: 'milestone',
      via: 'project'
    },
    funders: {
      collection: 'user',
      via: 'project',
      through: 'project_funder'
    },
    oracles: {
      collection: 'user',
      via: 'project',
      through: 'project_oracle'
    },
    followers: {
      collection: 'user',
      via: 'project',
      through: 'project_follower'
    },
    consensusSeconds: {
      type: 'number',
      defaultsTo: config.defaultProjectTimes.consensusSeconds
    },
    fundingSeconds: {
      type: 'number',
      defaultsTo: config.defaultProjectTimes.fundingSeconds
    },
    lastUpdatedStatusAt: {
      type: 'string',
      autoCreatedAt: true,
      required: false
    },
    id: { type: 'string', required: true },
    txHash: { type: 'string', required: false, allowNull: true },
    rejectionReason: { type: 'string', required: false, allowNull: true },
    currencyType: { type: 'string', required: false, allowNull: true },
    currency: { type: 'string', required: false, allowNull: true },
    additionalCurrencyInformation: {
      type: 'string',
      required: false,
      allowNull: true
    },
    ipfsHash: { type: 'string', required: false, allowNull: true },
    proposer: {
      columnName: 'proposerId',
      model: 'user'
    },
    parent: {
      columnName: 'parentId',
      model: 'project',
      required: false
    },
    revision: { type: 'number', required: false, defaultsTo: 1 },
    step: { type: 'number', required: false, defaultsTo: 0 },
    type: {
      type: 'string',
      validations: {
        isIn: Object.values(PROJECT_TYPES)
      },
      allowNull: true
    }
  }
};
