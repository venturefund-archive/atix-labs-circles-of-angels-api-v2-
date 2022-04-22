/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const countryService = require('../../services/countryService');

module.exports = {
  getCountries: () => async (request, reply) => {
    const response = await countryService.getAll();
    reply.status(200).send(response);
  }
};
