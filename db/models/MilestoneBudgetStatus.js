/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents the current status of the budget of a milestone
 * @attribute `id`: numerical representation of the state
 * @attribute `name`: name of the state
 */
module.exports = {
  identity: 'milestone_budget_status',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
