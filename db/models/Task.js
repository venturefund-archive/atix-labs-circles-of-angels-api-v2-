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
    taskHash: { type: 'string', required: false, allowNull: true },
    description: { type: 'string', required: true },
    reviewCriteria: { type: 'string', required: false, allowNull: true },
    category: { type: 'string', required: true },
    keyPersonnel: { type: 'string', required: false, allowNull: true },
    budget: { type: 'string', required: true },
    milestone: {
      columnName: 'milestoneId',
      model: 'milestone'
    },
    oracle: {
      columnName: 'oracleId',
      model: 'user'
    },
    createdAt: { type: 'string', autoCreatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
