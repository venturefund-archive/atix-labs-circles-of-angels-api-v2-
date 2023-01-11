/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const { ACTIVITY_STATUS } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'task',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    acceptanceCriteria: { type: 'string', required: true },
    budget: { type: 'string', required: true },
    deposited: { type: 'string', required: false, defaultsTo: '0' },
    spent: { type: 'string', required: false, defaultsTo: '0' },
    milestone: {
      columnName: 'milestoneId',
      model: 'milestone',
      required: true
    },
    auditor: {
      columnName: 'auditorId',
      model: 'user',
      required: true
    },
    reviewCriteria: { type: 'string', required: false, allowNull: true },
    taskHash: { type: 'string', required: false, allowNull: true },
    category: { type: 'string', required: false, allowNull: true },
    keyPersonnel: { type: 'string', required: false, allowNull: true },
    oracle: {
      columnName: 'oracleId',
      model: 'user'
    },
    proposer: {
      columnName: 'proposerId',
      model: 'user'
    },
    status: {
      type: 'string',
      defaultsTo: ACTIVITY_STATUS.NEW,
      validations: {
        isIn: Object.values(ACTIVITY_STATUS)
      }
    },
    reason: {
      type: 'string',
      required: false,
      allowNull: true
    },
    createdAt: { type: 'string', autoCreatedAt: true },
    deleted: { type: 'boolean', allowNull: false, defaultsTo: false },
    step: { type: 'number', required: false, defaultsTo: 0 },
    toSign: {
      type: 'json',
      required: false
    }
  }
};
