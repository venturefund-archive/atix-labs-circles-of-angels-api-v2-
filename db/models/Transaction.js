/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'transaction',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    sender: { type: 'string', required: true },
    txHash: { type: 'string', required: true },
    nonce: { type: 'number', required: true },
    createdAt: {
      type: 'string',
      autoCreatedAt: true,
      required: false
    }
  }
};
