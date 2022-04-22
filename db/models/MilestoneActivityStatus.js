/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents the current status of a milestone or activity
 * @attribute `name`: name of the state
 * @attribute `status`: numerical representation of the state
 */
module.exports = {
  identity: 'milestone_activity_status',
  primaryKey: 'status',
  attributes: {
    status: { type: 'number', required: true },
    name: { type: 'string', required: true }
  }
};
