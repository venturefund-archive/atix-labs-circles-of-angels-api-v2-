/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represent a user_funder, specific information for users with Funder role
 * @attribute `id`: user_funder id in the business domain
 * @attribute `user`: reference to user owner of this information
 * @attribute `phoneNumber`: user telephone number
 */
module.exports = {
  identity: 'user_funder',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    user: {
      columnName: 'userId',
      model: 'user'
    },
    phoneNumber: { type: 'string', allowNull: true }
  }
};
