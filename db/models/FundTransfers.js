/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents a bank transfer register
 * @attribute `transferId`: Bank transfer recipt
 * @attribute `senderId`: id of the user who sends
 * @attribute `destinationAccount`: id of the user that receives
 * @attribute `projectId`: the project id to which this bank transfer belongs
 * @attribute `amount`: amount of money transferred
 * @attribute `currency`: currency in which the transfer was made
 */

const { txFunderStatus } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'fund_transfer',
  primaryKey: 'id',
  attributes: {
    transferId: { type: 'string', required: true },
    destinationAccount: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
    rejectionReason: { type: 'string', required: false, allowNull: true },
    receiptPath: { type: 'string', required: true },
    sender: {
      columnName: 'senderId',
      model: 'user'
    },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    status: {
      type: 'string',
      defaultsTo: txFunderStatus.PENDING,
      validations: {
        isIn: Object.values(txFunderStatus)
      }
    },
    createdAt: { type: 'string', autoCreatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    txHash: { type: 'string', required: false, allowNull: true }
  }
};
