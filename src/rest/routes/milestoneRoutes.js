/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/milestones';
const handlers = require('./handlers/milestoneHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  clientErrorResponse,
  serverErrorResponse
} = require('../util/responses');

const idParam = (description, param) => ({
  type: 'object',
  properties: {
    [param]: {
      type: 'integer',
      description
    }
  }
});

const uuidParam = (description, param) => ({
  type: 'object',
  properties: {
    [param]: {
      type: 'string',
      description
    }
  }
});

const projectIdParam = uuidParam('Project identification', 'projectId');
const milestoneIdParam = idParam('Milestone identification', 'milestoneId');

const projectResponse = {
  type: 'object',
  properties: {
    projectName: { type: 'string' },
    mission: { type: 'string' },
    problemAddressed: { type: 'string' },
    location: { type: 'string' },
    timeframe: { type: 'string' },
    proposal: { type: 'string' },
    faqLink: { type: 'string' },
    coverPhotoPath: { type: 'string' },
    cardPhotoPath: { type: 'string' },
    milestonePath: { type: 'string' },
    goalAmount: { type: 'integer' },
    status: { type: 'string' },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    transactionHash: { type: 'string', required: false },
    id: { type: 'integer' }
  }
};

const evidence = {
  type: 'object',
  properties: {
    id: {
      type: 'number'
    },
    description: {
      type: 'string'
    },
    proof: {
      type: 'string'
    },
    approved: {
      type: 'boolean'
    },
    txHash: {
      type: 'string'
    },
    status: {
      type: 'string'
    }
  }
};

const taskResponse = {
  type: 'object',
  properties: {
    taskHash: { type: 'string' },
    description: { type: 'string' },
    reviewCriteria: { type: 'string' },
    category: { type: 'string' },
    keyPersonnel: { type: 'string' },
    budget: { type: 'string' },
    createdAt: { type: 'string' },
    oracle: { type: ['string', 'null'] },
    id: { type: 'number' },
    evidences: { type: 'array', items: { type: 'array', items: evidence } }
  }
};

const milestonesFiltersProperties = {
  claimStatus: {
    anyOf: [
      {
        type: 'array',
        items: { type: 'string' }
      },
      {
        type: 'string'
      }
    ]
  }
};

const milestoneProperties = {
  title: { type: 'string' },
  description: { type: 'string' }
};

const milestonesResponse = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    createdAt: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    tasks: {
      type: 'array',
      items: taskResponse
    },
    project: projectResponse
  },
  description: 'Returns milestones'
};

const successWithMilestoneIdResponse = {
  type: 'object',
  properties: {
    milestoneId: { type: 'integer' }
  },
  description: 'Returns the id of the milestone'
};

const milestoneRoutes = {
  createMilestone: {
    method: 'post',
    path: `/projects/:projectId${basePath}`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.POST.name],
        description: 'Creates a new milestone for an existing project',
        summary: 'Create new milestone',
        params: { projectIdParam },
        body: {
          type: 'object',
          properties: milestoneProperties,
          required: ['title', 'description'],
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithMilestoneIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createMilestone
  },

  updateMilestone: {
    method: 'put',
    path: `${basePath}/:milestoneId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.PUT.name],
        description: 'Edits the information of an existing milestone',
        summary: 'Edits milestone information',
        params: { milestoneIdParam },
        body: {
          type: 'object',
          properties: milestoneProperties,
          additionalProperties: false
        },
        response: {
          ...successResponse(successWithMilestoneIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateMilestone
  },

  deleteMilestone: {
    method: 'delete',
    path: `${basePath}/:milestoneId`,
    options: {
      beforeHandler: ['adminAuth', 'withUser'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.DELETE.name],
        description:
          'Deletes an existing milestone for an existing project and all its tasks',
        summary: 'Delete milestone',
        params: milestoneIdParam,
        response: {
          ...successResponse(successWithMilestoneIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteMilestone
  },

  claimMilestone: {
    method: 'post',
    path: `${basePath}/:milestoneId/claim`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.POST.name],
        description: 'Milestone claim',
        summary: 'Milestone claim',
        params: milestoneIdParam,
        response: {
          ...successResponse(successWithMilestoneIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.claimMilestone
  },

  transferredMilestone: {
    method: 'put',
    path: `${basePath}/:milestoneId/transferred`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.PUT.name],
        description: 'Milestone transferred',
        summary: 'Milestone transferred',
        params: milestoneIdParam,
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' }
        },
        response: {
          ...successResponse(successWithMilestoneIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.transferredMilestone
  }
};

const routes = {
  ...milestoneRoutes,
  getMilestones: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.MILESTONE.name, routeTags.GET.name],
        description: 'Returns milestones that match with the params',
        summary: 'Get milestones',
        querystring: milestonesFiltersProperties
      },
      response: {
        ...successResponse(milestonesResponse),
        ...clientErrorResponse(),
        ...serverErrorResponse()
      }
    },
    handler: handlers.getMilestones
  }
};

module.exports = routes;
