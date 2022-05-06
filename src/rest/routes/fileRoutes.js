/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/files';
const handlers = require('./handlers/fileHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const fileResponse = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  },
  description: 'Returns the file object'
};

const fileStreamResponse = {
  type: 'string',
  description: 'Template file stream'
};

const routes = {
  deleteFile: {
    method: 'delete',
    path: `${basePath}/:fileId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.FILE.name, routeTags.DELETE.name],
        description: 'Deletes an existing file',
        summary: 'Delete file',
        params: {
          type: 'object',
          properties: {
            fileId: { type: 'integer', description: 'File to delete' }
          }
        },
        response: {
          ...successResponse(fileResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteFile
  },

  getMilestonesTemplateFile: {
    method: 'get',
    path: `${basePath}/milestones/template`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.FILE.name, routeTags.GET.name],
        description: 'Returns milestones template file',
        summary: 'Returns milestones template file',
        response: {
          ...successResponse(fileStreamResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getMilestonesTemplateFile
  }
};

module.exports = routes;
