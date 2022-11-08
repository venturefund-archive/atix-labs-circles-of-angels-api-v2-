/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'task',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    acceptanceCriteria: { type: 'string', required: true },
    budget: { type: 'string', required: true },
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
    createdAt: { type: 'string', autoCreatedAt: true }
  }
};
