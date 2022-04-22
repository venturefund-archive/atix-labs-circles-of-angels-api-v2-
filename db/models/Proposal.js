/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { txProposalStatus } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'proposal',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    proposalId: { type: 'number', required: false, allowNull: true },
    daoId: { type: 'number', required: true, allowNull: false },
    applicant: { type: 'string', required: true },
    proposer: { type: 'string', required: true },
    description: { type: 'string', required: true },
    type: { type: 'number', required: true },
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
