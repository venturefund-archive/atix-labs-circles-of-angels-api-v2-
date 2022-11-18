/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/activities';
const handlers = require('./handlers/activityHandlers');
const routeTags = require('../util/routeTags');
const { idParam } = require('../util/params');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const taskIdParam = idParam('Task identification', 'taskId');
const activityIdParam = idParam('Activity identification', 'activityId');
const milestoneIdParam = idParam('Milestone identification', 'milestoneId');
const evidenceIdParam = idParam('Evidence identification', 'evidenceId');

const taskProperties = {
  description: { type: 'string' },
  reviewCriteria: { type: 'string' },
  category: { type: 'string' },
  keyPersonnel: { type: 'string' },
  budget: { type: 'string' }
};

const activityProperties = {
  title: { type: 'string' },
  description: { type: 'string' },
  acceptanceCriteria: { type: 'string' },
  budget: { type: 'string' },
  auditor: { type: 'string' }
};

const oracleProperties = {
  oracleId: { type: 'string' }
};

const successWithTaskIdResponse = {
  type: 'object',
  properties: {
    taskId: { type: 'integer' }
  },
  description: 'Returns the id of the task'
};

const successWithActivityIdResponse = {
  type: 'object',
  properties: {
    activityId: { type: 'integer' }
  },
  description: 'Returns the id of the activity'
};

const successWithTaskEvidences = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      createdAt: { type: 'string' },
      description: { type: 'string' },
      proof: { type: 'string' },
      approved: { type: 'boolean' },
      task: { type: 'integer' },
      txLink: { type: 'string' }
    },
    description: 'Returns an array with the task evidences'
  }
};

const activityRoutes = {
  createActivity: {
    method: 'post',
    path: `/milestones/:milestoneId${basePath}`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Creates a new activity for an existing milestone',
        summary: 'Creates new activity',
        params: { milestoneIdParam },
        body: {
          type: 'object',
          properties: activityProperties,
          required: [
            'title',
            'description',
            'acceptanceCriteria',
            'budget',
            'auditor'
          ],
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithActivityIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createActivity
  },
  updateActivity: {
    method: 'put',
    path: `${basePath}/:activityId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Update the information of an existing activity',
        summary: 'Update activity information',
        params: { activityIdParam },
        body: {
          type: 'object',
          properties: activityProperties,
          additionalProperties: false
        },
        required: [
          'title',
          'description',
          'acceptanceCriteria',
          'budget',
          'auditor'
        ],
        response: {
          ...successResponse(successWithActivityIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateActivity
  },
  deleteActivity: {
    method: 'delete',
    path: `${basePath}/:taskId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.DELETE.name],
        description: 'Deletes an existing task',
        summary: 'Deletes task',
        params: { taskIdParam },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteTask
  }
};

const oracleRoutes = {
  assignOracle: {
    method: 'put',
    path: `${basePath}/:taskId/assign-oracle`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.PUT.name],
        description: 'Assigns an existing oracle user to an existing activity',
        summary: 'Assign oracle to activity',
        params: { taskIdParam },
        body: {
          type: 'object',
          properties: oracleProperties,
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithTaskIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.assignOracle
  }
};

const evidencesRoutes = {
  addEvidence: {
    method: 'post',
    path: `${basePath}/:activityId/evidence`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Add evidence to activity for an existing project',
        summary: 'Add evidence to activity',
        params: { activityIdParam },
        type: 'multipart/form-data',
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addEvidence
  },

  addApprovedClaim: {
    method: 'post',
    path: `${basePath}/:taskId/claim/approve/get-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Get unsigned tx for an approved claim of a task for an existing project',
        summary: 'Get unsigned tx for an approved claim',
        params: { taskIdParam },
        type: 'multipart/form-data',
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getApprovedClaimTransaction
  },

  addDisapprovedClaim: {
    method: 'post',
    path: `${basePath}/:taskId/claim/disapprove/get-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Get unsigned tx for a disapproved claim of a task for an existing project',
        summary: 'Get unsigned tx for a disapproved claim',
        params: { taskIdParam },
        type: 'multipart/form-data',
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getDisapprovedClaimTransaction
  },

  sendDisapprovedClaimTransaction: {
    method: 'post',
    path: `${basePath}/:taskId/claim/disapprove/send-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Send approved claim signed transaction to blockchain',
        summary: 'Send approved claim signed tx to blockchain',
        params: { taskIdParam },
        type: 'multipart/form-data',
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: () => handlers.sendClaimTransaction(false)
  },

  sendApprovedClaimTransaction: {
    method: 'post',
    path: `${basePath}/:taskId/claim/approve/send-transaction`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description: 'Send disapproved claim signed transaction to blockchain',
        summary: 'Send disapproved claim signed tx to blockchain',
        params: { taskIdParam },
        type: 'multipart/form-data',
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: () => handlers.sendClaimTransaction(true)
  },

  getTaskEvidences: {
    method: 'get',
    path: `${basePath}/:taskId/claims`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.GET.name],
        description: 'Get all the evidences uploaded for a specific task',
        summary: 'Get task evidences',
        params: { taskIdParam },
        response: {
          ...successResponse(successWithTaskEvidences),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getTasksEvidences
  },
  getBlockchainData: {
    method: 'get',
    path: '/evidences/:evidenceId/blockchain-data',
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.GET.name],
        description:
          'Returns the blockchain information related to the evidence',
        summary: 'Returns blockchain information',
        params: evidenceIdParam,
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getEvidenceBlockchainData
  }
};

const routes = {
  ...activityRoutes,
  ...oracleRoutes,
  ...evidencesRoutes
};

module.exports = routes;
