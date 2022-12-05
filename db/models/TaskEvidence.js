/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const {
  evidenceStatus,
  evidenceTypes
} = require('../../src/rest/util/constants');

module.exports = {
  identity: 'task_evidence',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    type: {
      type: 'string',
      required: true,
      validations: {
        isIn: Object.values(evidenceTypes)
      }
    },
    income: { type: 'string', required: false, defaultsTo: '0' },
    outcome: { type: 'string', required: false, defaultsTo: '0' },
    transferTxHash: { type: 'string', required: false, allowNull: true },
    proof: { type: 'string', required: false, allowNull: true },
    approved: { type: 'boolean', required: false, allowNull: true },
    activity: {
      columnName: 'taskId',
      model: 'task'
    },
    txHash: { type: 'string', required: false, allowNull: true },
    status: {
      type: 'string',
      defaultsTo: evidenceStatus.NEW,
      validations: {
        isIn: Object.values(evidenceStatus)
      }
    },
    reason: {
      type: 'string',
      required: false,
      allowNull: true
    },
    files: {
      collection: 'evidence_file',
      via: 'evidence'
    },
    createdAt: { type: 'string', autoCreatedAt: true }
  }
};
