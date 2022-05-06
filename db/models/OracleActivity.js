/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'oracle_activity',
  primaryKey: 'id',
  attributes: {
    user: {
      columnName: 'userId',
      model: 'user'
    },
    activity: {
      columnName: 'activityId',
      model: 'task'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
