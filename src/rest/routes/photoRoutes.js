/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/photos';
const handlers = require('./handlers/photoHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  getPhoto: {
    method: 'get',
    path: `${basePath}/:photoId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PHOTO.name, routeTags.GET.name],
        description: 'Returns an existing image encoded in base64',
        summary: 'Get photo',
        params: {
          type: 'object',
          properties: {
            photoId: { type: 'integer', description: 'Photo to get' }
          }
        },
        response: {
          200: { type: 'string', description: 'Photo encoded in base64' },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getPhoto
  }
};

module.exports = routes;
