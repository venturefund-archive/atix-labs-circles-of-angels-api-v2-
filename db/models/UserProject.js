/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents a relationship between a user and a project
 * @attribute `status`: state in which the user is with respect to a project
 * @attribute `userId`: user id
 * @attribute `projectId`: project id
 */
module.exports = {
  identity: 'user_project',
  primaryKey: 'id',
  attributes: {
    user: {
      columnName: 'userId',
      model: 'user',
      required: true
    },
    project: {
      columnName: 'projectId',
      model: 'project',
      required: true
    },
    role: {
      columnName: 'roleId',
      model: 'role',
      required: true
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
