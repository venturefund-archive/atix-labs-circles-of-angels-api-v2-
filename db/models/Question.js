/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'question',
  primaryKey: 'id',
  attributes: {
    question: { type: 'string', required: true },
    role: { type: 'number', autoCreatedAt: true, required: false },
    answerLimit: { type: 'number', required: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
