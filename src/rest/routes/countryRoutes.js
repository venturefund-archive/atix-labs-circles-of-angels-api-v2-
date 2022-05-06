/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/countries';
const handlers = require('./handlers/countryHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const countriesResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      callingCode: { type: 'number' }
    }
  },
  description: 'Returns all countries'
};

const routes = {
  getAllCountries: {
    method: 'get',
    path: `${basePath}`,
    options: {
      schema: {
        tags: [routeTags.COUNTRY.name, routeTags.GET.name],
        description: 'Gets all countries.',
        summary: 'Gets all countries',
        response: {
          ...successResponse(countriesResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getCountries
  }
};

module.exports = routes;
