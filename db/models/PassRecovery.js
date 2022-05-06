/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'pass_recovery',
  primaryKey: 'id',
  attributes: {
    email: { type: 'string', required: true },
    token: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
