/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/userProjects';
const handlers = require('./handlers/userProjectHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  signAgreement: {
    method: 'put',
    path: `${basePath}/:userProjectId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.PUT.name],
        description:
          'Updates the sign status of the agreement for an existing project by an existing funder',
        summary: 'Funder sign project agreement',
        params: {
          type: 'object',
          properties: {
            userProjectId: {
              type: 'integer',
              description:
                'User-Project relation to change the signature status'
            }
          }
        },
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              minimum: 0,
              maximum: 1,
              description: '1 to mark as signed, 0 to mark as not signed'
            }
          }
        },
        response: {
          200: {
            description: 'Returns the record that was modified',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                id: { type: 'integer' },
                user: { type: 'integer' },
                project: { type: 'integer' }
              }
            }
          },
          '4xx': {
            description: 'Returns a message describing the error',
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.signAgreement
  },

  getUsers: {
    method: 'get',
    path: `${basePath}/projects/:projectId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.GET.name],
        description:
          'Returns all funders related to a project and their signature status',
        summary: 'Get all funders and signatures by project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              description: 'Project to get the users from',
              type: 'integer'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            description: 'Returns a list of user-project objects',
            items: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                id: { type: 'integer' },
                project: { type: 'integer' },
                user: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    address: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    id: { type: 'integer' },
                    role: { type: 'integer' },
                    registrationStatus: { type: 'integer' }
                  }
                }
              }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.getUsers
  },
  // TODO: this has to be replaced by relateUserWithProject
  createUserProject: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.POST.name],
        description:
          'Creates a new relation between an existing funder and an existing project',
        summary: 'Associate a funder to a project',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            projectId: { type: 'integer' }
          },
          description: 'Funder id and project id to create the relation'
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the relation was created',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.createUserProject
  },

  relateUserWithProject: {
    method: 'post',
    path: '/user-project',
    options: {
      beforeHandler: ['adminAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.POST.name],
        description:
          'Creates a new relation between an existing user and an existing project',
        summary: 'Associate a funder to a project',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            projectId: { type: 'string' },
            roleId: { type: 'number' }
          },
          description: 'User id, role id and project id to create the relation'
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the relation was created',
            properties: {
              id: { type: 'integer' },
              user: { type: 'string' },
              project: { type: 'integer' },
              role: { type: 'number' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.relateUserWithProject
  },

  removeUserProject: {
    method: 'delete',
    path: '/user-project',
    options: {
      beforeHandler: ['adminAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER_PROJECT.name, routeTags.POST.name],
        description:
          'Creates a new relation between an existing user and an existing project',
        summary: 'Associate a funder to a project',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            projectId: { type: 'integer' },
            roleId: { type: 'number' }
          },
          description: 'User id, role id and project id to create the relation'
        },
        response: {
          200: {
            type: 'object',
            description: 'Success message if the relation was created',
            properties: {
              id: { type: 'integer' },
              user: { type: 'string' },
              project: { type: 'integer' },
              role: { type: 'number' }
            }
          },
          '4xx': {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            description: 'Returns a message describing the error',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.removeUserProject
  }
};

module.exports = routes;
