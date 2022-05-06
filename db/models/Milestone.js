/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { claimMilestoneStatus } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'milestone',
  primaryKey: 'id',
  attributes: {
    category: { type: 'string', required: true },
    description: { type: 'string', required: true },
    claimStatus: { type: 'string', defaultsTo: claimMilestoneStatus.PENDING },
    claimReceiptPath: { type: 'string', required: false, allowNull: true },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    tasks: {
      collection: 'task',
      via: 'milestone'
    },
    createdAt: { type: 'string', autoCreatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
