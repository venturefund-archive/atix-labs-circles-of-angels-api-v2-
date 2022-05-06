/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 *@description Represents a general configuration of the API
 *@attribute `key`: unique key of a configuration
 *@attribute `value`: the value of that configuration
 */
module.exports = {
  identity: 'configs',
  primaryKey: 'key',
  attributes: {
    key: { type: 'string', required: true },
    value: { type: 'string', required: false }
  },
  async findByKey({ key }) {
    return this.findOne(key);
  }
};
