/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'blockchain_block',
  primaryKey: 'id',
  attributes: {
    blockNumber: { type: 'number', required: true },
    transactionHash: { type: 'string', required: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
  }
};
