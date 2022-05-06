/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represent a user wallet of Circles Of Angels.
 * @attribute `id`: user wallet id.
 * @attribute `userId`: user id owner of wallet .
 * @attribute `encryptedWallet`: wallet associated to user id.
 * @attribute `address`: address associated to wallet and user
 * @attribute `mnemonic`: mnemonic to descrypt the wallet
 */

module.exports = {
  identity: 'user_wallet',
  primaryKey: 'id',
  attributes: {
    user: {
      columnName: 'userId',
      model: 'user'
    },
    address: { type: 'string', required: true },
    encryptedWallet: { type: 'json', required: true },
    mnemonic: { type: 'string', required: false, allowNull: true },
    iv: { type: 'string', required: false, allowNull: true },
    active: { type: 'boolean', defaultsTo: false, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    createdAt: { type: 'string', autoCreatedAt: true, required: false }
  }
};
