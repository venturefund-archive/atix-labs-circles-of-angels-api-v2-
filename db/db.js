/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const fastWater = require('fast-water');
/**
 * Register the actual db to a fastify instance
 * @method register
 * @param fastify fastify instance
 */
exports.register = async fastify => {
  fastify.register(fastWater, fastify.configs.database);
};
