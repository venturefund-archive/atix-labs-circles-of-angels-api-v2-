/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txEvidenceStatus } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'task_evidence',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    createdAt: { type: 'string', autoCreatedAt: true },
    description: { type: 'string', required: true },
    proof: { type: 'string', required: true },
    approved: { type: 'boolean', required: true },
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
    }
  }
};
