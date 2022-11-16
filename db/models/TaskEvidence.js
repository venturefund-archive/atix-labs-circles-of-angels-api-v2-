/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const {
  txEvidenceStatus,
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
    amount: { type: 'string', required: false, allowNull: true },
    transferTxHash: { type: 'string', required: false, allowNull: true },
    proof: { type: 'string', required: false, allowNull: true },
    approved: { type: 'boolean', required: false, allowNull: true },
    task: {
      columnName: 'taskId',
      model: 'task'
    },
    txHash: { type: 'string', required: false, allowNull: true },
    status: {
      type: 'string',
      defaultsTo: txEvidenceStatus.NOT_SENT,
      validations: {
        isIn: Object.values(txEvidenceStatus)
      }
    },
    createdAt: { type: 'string', autoCreatedAt: true }
  }
};
