/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represent a user social entrepreneur,
 *              specific information for users with Funder role
 * @attribute `id`: user_social_entrepreneur id in the business domain
 * @attribute `user`: reference to user owner of this information
 * @attribute `company`: company name
 * @attribute `phoneNumber`: phone number
 */
module.exports = {
  identity: 'user_social_entrepreneur',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    user: {
      columnName: 'userId',
      model: 'user'
    },
    company: { type: 'string', allowNull: true },
    phoneNumber: { type: 'string', allowNull: true }
  }
};
