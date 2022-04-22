/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txProposalStatus } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'vote',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    daoId: { type: 'number', required: true },
    proposalId: { type: 'number', required: true },
    vote: { type: 'number', required: true },
    voter: { type: 'string', required: true },
    txHash: { type: 'string', required: false, allowNull: true },
    createdAt: { type: 'string', autoCreatedAt: true },
    status: {
      type: 'string',
      defaultsTo: txProposalStatus.NOT_SENT,
      validations: {
        isIn: Object.values(txProposalStatus)
      }
    }
  }
};
