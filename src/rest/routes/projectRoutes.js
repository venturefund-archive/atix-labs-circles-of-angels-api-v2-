/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/projects';
const handlers = require('./handlers/projectHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');
const { projectStatuses, txTypes } = require('../util/constants');
const { idParam } = require('../util/params');

const basicInformationProperties = {
  projectName: { type: 'string' },
  location: { type: 'string' },
  timeframe: { type: 'number' },
  timeframeUnit: { type: 'string' }
};

const projectThumbnailProperties = {
  projectName: { type: 'string' },
  location: { type: 'string' },
  timeframe: { type: 'string' },
  goalAmount: { type: 'number' }
};

const imgPathProperty = {
  imgPath: { type: 'string' }
};

const cardPhotoPathProperty = {
  cardPhotoPath: { type: 'string' }
};

const featuredProjectsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: Object.assign(
      {},
      {
        id: { type: 'string' },
        status: { type: 'string' }
      },
      projectThumbnailProperties,
      cardPhotoPathProperty
    ),
    description: 'Returns the project description'
  },
  description: 'List of all featured projects'
};

const projectDetailProperties = {
  mission: { type: 'string' },
  problemAddressed: { type: 'string' }
};

const projectDetailsProperties = {
  ...projectDetailProperties,
  currencyType: { type: 'string' },
  currency: { type: 'string' },
  additionalCurrencyInformation: { type: 'string' },
  type: { type: 'string' }
};

const projectProposalProperties = {
  proposal: { type: 'string' }
};

const milestonesResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      category: { type: 'string' },
      description: { type: 'string' },
      claimStatus: { type: 'string' },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            taskHash: { type: 'string' },
            description: { type: 'string' },
            reviewCriteria: { type: 'string' },
            category: { type: 'string' },
            keyPersonnel: { type: 'string' },
            oracle: { type: ['string', 'null'] },
            budget: { type: 'string' },
            verified: { type: 'boolean' }
          }
        }
      }
    }
  },
  description: 'Returns all milestones of a project'
};

const projectIdParam = idParam('Project identification', 'projectId', 'string');

const successWithProjectIdResponse = {
  type: 'object',
  properties: {
    projectId: { type: 'string' }
  },
  description: 'Returns the id of the project'
};

const successWithProjectExperienceIdResponse = {
  type: 'object',
  properties: {
    projectExperienceId: { type: 'integer' }
  },
  description: 'Returns the id of the project experience'
};

const successWithCandidateIdResponse = {
  type: 'object',
  properties: {
    candidateId: { type: 'integer' }
  },
  description: 'Returns the id of the candidate'
};

const successWithBooleanResponse = {
  type: 'boolean',
  description: 'Returns the boolean result'
};

const successWithApplyingResponse = {
  type: 'object',
  properties: {
    oracles: { type: 'boolean' },
    funders: { type: 'boolean' }
  },
  description: 'Returns if user already apply to project'
};

const userProperties = {
  id: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  role: { type: 'string' },
  email: { type: 'string' }
};

const experiencePhotoProperties = {
  id: { type: 'integer' },
  path: { type: 'string' }
};

const experienceProperties = {
  id: { type: 'integer' },
  project: { type: 'integer' },
  comment: { type: 'string' },
  user: { type: 'object', properties: userProperties },
  photos: {
    type: 'array',
    items: { type: 'object', properties: experiencePhotoProperties }
  }
};

const successWithExperiencesResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: experienceProperties
  }
};

// FIXME: I don't think this is the best way to do this but ¯\_(ツ)_/¯
const responseWithMilestoneErrors = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rowNumber: { type: 'number' },
          msg: { type: 'string' }
        }
      }
    },
    projectId: { type: 'string' }
  },
  description:
    'Returns an array with all errors while processing the milestone file or the project id if successful'
};

const userResponse = {
  type: 'object',
  properties: userProperties,
  description: 'Returns and object with the user information'
};

const usersResponse = {
  type: 'object',
  properties: {
    owner: userResponse,
    followers: { type: 'array', items: userResponse },
    funders: { type: 'array', items: userResponse },
    oracles: { type: 'array', items: userResponse }
  }
};

const projectsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      projectName: { type: 'string' },
      mission: { type: 'string' },
      problemAddressed: { type: 'string' },
      location: { type: 'string' },
      timeframe: { type: 'string' },
      timeframeUnit: { type: 'string' },
      proposal: { type: 'string' },
      faqLink: { type: 'string' },
      coverPhotoPath: { type: 'string' },
      cardPhotoPath: { type: 'string' },
      milestonePath: { type: 'string' },
      goalAmount: { type: 'number' },
      currency: { type: 'string' },
      status: { type: 'string' },
      revision: { type: 'number' },
      owner: userResponse,
      createdAt: { type: 'string' },
      proposalFilePath: { type: 'string' },
      agreementFilePath: { type: 'string' },
      id: { type: 'string' },
      nextStatusUpdateAt: { type: 'string' },
      parent: { type: 'string' },
      beneficiary: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          firstName: {
            type: 'string'
          },
          lastName: {
            type: 'string'
          }
        }
      },
      type: { type: 'string' }
    }
  },
  description: 'Returns all projects'
};

const sucessProjectTransactions = {
  type: 'object',
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          txHash: { type: 'string' },
          value: { type: 'string' },
          tokenSymbol: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          timestamp: { type: 'string' }
        }
      }
    }
  }
};

const successProjectEvidences = {
  type: 'object',
  properties: {
    evidences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          role: { type: 'string' },
          userName: { type: 'string' },
          activityType: { type: 'string' },
          amount: { type: 'string' },
          destinationAccount: { type: 'string' }
        }
      }
    }
  }
};

const changelogResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      project: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          projectName: { type: ['string', 'null'] }
        }
      },
      revision: { type: ['integer', 'null'] },
      milestone: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' }
        },
        nullable: true
      },
      activity: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          auditor: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          }
        },
        nullable: true
      },
      evidence: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' }
        },
        nullable: true
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          isAdmin: { type: 'boolean' },
          roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        },
        nullable: true
      },
      transaction: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      action: { type: ['string', 'null'] },
      extraData: {
        type: 'object',
        nullable: true,
        additionalProperties: true
      },
      datetime: { type: 'string' }
    }
  },
  description: 'Returns all changelogs of a project'
};

const successBooleanResponse = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    }
  }
};

const successProjectToReviewResponse = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    },
    toSign: { type: 'string' }
  }
};

const sendTransactionResponse = {
  type: 'object',
  properties: {
    txHash: {
      type: 'string'
    }
  }
};

const basicInformationRoutes = {
  createProject: {
    method: 'post',
    path: `${basePath}`,
    options: {
      beforeHandler: ['withUser', 'adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project with default title.',
        summary: 'Create new project',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: basicInformationProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProject
  },
  cloneProject: {
    method: 'post',
    path: `${basePath}/:projectId/clone`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Clones project with all its relations.',
        summary: 'Clones a project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.cloneProject
  },
  updateBasicProjectInformation: {
    method: 'put',
    path: `${basePath}/:projectId/basic-information`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Update basic project information.',
        summary: 'Update basic information',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: basicInformationProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateBasicProjectInformation
  }
};

const projectDetailsRoutes = {
  updateProjectDetails: {
    method: 'put',
    path: `${basePath}/:projectId/details`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Updates the details of an existing project.',
        summary: 'Updates a project details',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectDetailsProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectDetails
  }
};

const projectThumbnailRoutes = {
  createProjectThumbnail: {
    method: 'post',
    path: `${basePath}/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project thumbnail to it.',
        summary: 'Create new project and project thumbnail',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectThumbnailProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProjectThumbnail
  },

  updateProjectThumbnail: {
    method: 'put',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Updates the thumbnail of an existing draft project',
        summary: 'Updates an existing project thumbnail',
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectThumbnailProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectThumbnail
  },

  getThumbnail: {
    method: 'get',
    path: `${basePath}/:projectId/description`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets the thumbnail information of an existing project',
        summary: 'Gets a project thumbnail info',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              projectThumbnailProperties,
              imgPathProperty
            ),
            description: 'Returns the project description'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectThumbnail
  }
};

const projectDetailRoutes = {
  createProjectDetail: {
    method: 'post',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Creates new project and adds project detail to it.',
        summary: 'Create new project and project detail',
        params: projectIdParam,
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectDetailProperties
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createProjectDetail
  },
  updateProjectDetail: {
    method: 'put',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Updates the detail of an existing project.',
        summary: 'Updates a project detail',
        raw: {
          files: { type: 'object' },
          body: {
            type: 'object',
            properties: projectDetailProperties
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectDetail
  },
  getProjectDetail: {
    method: 'get',
    path: `${basePath}/:projectId/detail`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Returns the detail of an existing project',
        summary: 'Get project detail',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: Object.assign(
              {},
              projectDetailProperties,
              imgPathProperty
            ),
            description: 'Returns the project detail'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectDetail
  }
};

const projectProposalRoutes = {
  updateProjectProposal: {
    method: 'put',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description:
          'Adds or modifies the project proposal of an existing project.',
        summary: 'Adds or modifies project proposal',
        body: {
          type: 'object',
          properties: projectProposalProperties
        },
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectProposal
  },
  getProjectProposal: {
    method: 'get',
    path: `${basePath}/:projectId/proposal`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the project proposal of a project',
        summary: 'Gets project proposal',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'object',
            properties: projectProposalProperties,
            description: 'Returns the project proposal'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectProposal
  }
};

const projectMilestonesRoute = {
  getMilestonesTemplate: {
    // this endpoint should be in any other place and serve the static file
    method: 'get',
    path: '/templates/milestones',
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'descriptionHard',
        summary: 'summaryHard',
        params: projectIdParam,
        response: {
          ...successResponse({
            type: 'string',
            description: 'Returns the project milestone template stream'
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getTemplateOfProjectMilestone
  },
  processMilestonesFile: {
    method: 'put',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description:
          'Process excel file and creates the milestones of a project',
        summary: 'Creates milestones from file',
        type: 'multipart/form-data',
        raw: {
          type: 'object',
          properties: {
            files: { type: 'object' }
          }
        },
        params: projectIdParam,
        response: {
          ...successResponse(responseWithMilestoneErrors),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.processMilestonesFile
  },
  getMilestones: {
    method: 'get',
    path: `${basePath}/:projectId/milestones`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Returns the milestones of an existing project',
        summary: 'Gets milestones of a project',
        params: projectIdParam,
        response: {
          ...successResponse(milestonesResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectMilestones
  },
  getMilestonesFile: {
    method: 'get',
    path: `${basePath}/:projectId/milestonesFile`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: "Returns the specified project's milestones file",
        summary: 'Get a project milestones file',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project to download the milestones file from'
            }
          }
        },
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getMilestonesFile
  }
};

const projectStatusRoutes = {
  sendProjectToReview: {
    method: 'put',
    path: `${basePath}/:projectId/in-review`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Send a project to be reviewed',
        summary: 'Send a project to be reviewed',
        params: projectIdParam,
        response: {
          ...successResponse(successProjectToReviewResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendProjectToReview
  },

  cancelProjectReview: {
    method: 'put',
    path: `${basePath}/:projectId/cancel-review`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Cancel project review',
        summary: 'Cancel project review',
        params: projectIdParam,
        response: {
          ...successResponse(successBooleanResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.cancelProjectReview
  },

  publishProject: {
    method: 'put',
    path: `${basePath}/:projectId/publish`,
    options: {
      beforeHandler: ['adminAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Publish a project',
        summary: 'Publish a project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.publishProject
  },

  // TODO: make one endpoint for each possible status change
  updateProjectStatus: {
    method: 'put',
    path: `${basePath}/:projectId/status`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Update project status',
        summary: 'Update project status',
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: Object.values(projectStatuses)
            },
            rejectionReason: {
              type: 'string'
            }
          },
          required: ['status'],
          description: 'New project status'
        },
        type: 'object',
        params: projectIdParam,
        response: {
          // TODO send project updated to update on front too
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectStatus
  },

  updateProjectReview: {
    method: 'put',
    path: `${basePath}/:projectId/review`,
    options: {
      beforeHandler: ['adminAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Update project review',
        summary: 'Update project review',
        body: {
          type: 'object',
          properties: {
            approved: {
              type: 'boolean'
            },
            reason: {
              type: 'string'
            }
          },
          required: ['approved']
        },
        type: 'object',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.updateProjectReview
  },
  sendProjectReviewTransaction: {
    method: 'post',
    path: `${basePath}/:projectId/signature`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.ACTIVITY.name, routeTags.POST.name],
        description:
          'Send propose project edit transaction with signature of params',
        summary: 'Send propose project edit transaction',
        params: projectIdParam,
        body: {
          type: 'object',
          properties: {
            authorizationSignature: { type: 'string' }
          },
          additionalProperties: false
        },
        required: ['authorizationSignature'],
        response: {
          ...successResponse(sendTransactionResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendProjectReviewTransaction
  }
};

const commonProjectRoutes = {
  getProjects: {
    method: 'get',
    path: `${basePath}`,
    options: {
      // beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets all projects.',
        summary: 'Gets all project',
        response: {
          ...successResponse(projectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjects
  },

  getFundingProjects: {
    method: 'get',
    path: `${basePath}/funding`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets all projects in funding phase.',
        summary: 'Gets all projects in funding phase',
        response: {
          ...successResponse(projectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectsWithTransfers
  },

  getProject: {
    method: 'get',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: []
    },
    handler: handlers.getProject
  },

  getProjectFull: {
    method: 'get',
    path: `${basePath}/:projectId/full`,
    handler: handlers.getProjectFull,
    options: {
      beforeHandler: []
    }
  },

  getPublicProjects: {
    method: 'get',
    path: `${basePath}/public`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Get all public projects.',
        summary: 'Get all public project',
        response: {
          ...successResponse(projectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getPublicProjects
  },

  getProjectUsers: {
    method: 'get',
    path: `${basePath}/:projectId/users`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Returns the users related to an existing project',
        summary: 'Gets users of a project',
        params: projectIdParam,
        response: {
          ...successResponse(usersResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectUsers
  },

  followProject: {
    method: 'post',
    path: `${basePath}/:projectId/follow`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Follow project',
        summary: 'Follow project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.followProject
  },

  unfollowProject: {
    method: 'post',
    path: `${basePath}/:projectId/unfollow`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Unfollow project',
        summary: 'Unfollow project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.unfollowProject
  },

  isFollower: {
    method: 'get',
    path: `${basePath}/:projectId/follower`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Analize if user is following the project',
        summary: 'Check project following',
        params: projectIdParam,
        response: {
          ...successResponse(successWithBooleanResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.isFollower
  },

  applyAsOracle: {
    method: 'post',
    path: `${basePath}/:projectId/oracles`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Apply as a possible oracle for a project',
        summary: 'Apply as oracle',
        params: projectIdParam,
        response: {
          ...successResponse(successWithCandidateIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.applyAsOracle
  },

  applyAsFunder: {
    method: 'post',
    path: `${basePath}/:projectId/funders`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Apply as a possible funder for a project',
        summary: 'Apply as funder',
        params: projectIdParam,
        response: {
          ...successResponse(successWithCandidateIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.applyAsFunder
  },

  isCandidate: {
    method: 'get',
    path: `${basePath}/:projectId/candidate`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Analize if user already applied to the project',
        summary: 'Check project applying',
        params: projectIdParam,
        response: {
          ...successResponse(successWithApplyingResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.isCandidate
  },
  getBlockchainData: {
    method: 'get',
    path: `${basePath}/:projectId/blockchain-data`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description:
          'Returns the blockchain information related to the project',
        summary: 'Returns blockchain information',
        params: projectIdParam,
        response: {
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getBlockchainData
  }
};

const projectExperienceRoutes = {
  addExperience: {
    method: 'post',
    path: `${basePath}/:projectId/experiences`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.POST.name],
        description: 'Adds a new experience to an existing project',
        summary: 'Adds a new experience to project',
        params: projectIdParam,
        raw: {
          body: {
            type: 'object',
            properties: experienceProperties
          },
          files: { type: 'array', items: { type: 'object' } }
        },
        response: {
          ...successResponse(successWithProjectExperienceIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.addExperienceToProject
  },
  getExperiencesOfProject: {
    method: 'get',
    path: `${basePath}/:projectId/experiences`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets all experiences of an existing project.',
        summary: 'Gets all experiences of a project.',
        params: projectIdParam,
        response: {
          ...successResponse(successWithExperiencesResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getExperiencesOfProject
  }
};

const featuredProjectsRoutes = {
  getFeaturedProjects: {
    method: 'get',
    path: `${basePath}/featured`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Gets all featured projects.',
        summary: 'Gets all featured projects.',
        response: {
          ...successResponse(featuredProjectsResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getFeaturedProjects
  }
};

const adminRoutes = {
  setProjectAsExecuting: {
    method: 'put',
    path: `${basePath}/:projectId/status/executing`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Set project as executing as an admin',
        summary: 'Set project as executing',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.setProjectAsExecuting
  },

  setProjectAsFunding: {
    method: 'put',
    path: `${basePath}/:projectId/status/funding`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Set project as funding as an admin',
        summary: 'Set project as executing',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.setProjectAsFunding
  },

  deleteProject: {
    method: 'delete',
    path: `${basePath}/:projectId`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.DELETE.name],
        description: 'Deletes a project',
        summary: 'Deletes a project',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.deleteProject
  }
};

const projectTransactionsRoutes = {
  getProjectTransactions: {
    method: 'get',
    path: `${basePath}/:projectId/transactions`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Get transactions of address associated to project',
        summary: 'Get transactions of project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string'
            },
            type: { type: 'string', enum: Object.values(txTypes) }
          }
        },
        response: {
          ...successResponse(sucessProjectTransactions),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectTransactions
  }
};

const changelogRoutes = {
  getProjectChangelog: {
    method: 'get',
    path: `${basePath}/:projectId/changelog`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Get changelog of a project.',
        summary: 'Get project changelog.',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string'
            },
            milestoneId: { type: 'integer' },
            activityId: { type: 'integer' },
            revisionId: { type: 'integer' },
            evidenceId: { type: 'integer' },
            userId: { type: 'integer' }
          }
        },
        response: {
          ...successResponse(changelogResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectChangelog
  }
};

const evidencesRoutes = {
  getProjectEvidences: {
    method: 'get',
    path: `${basePath}/:projectId/evidences`,
    options: {
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.GET.name],
        description: 'Get approved evidences of given project',
        summary: 'Get evidences of project',
        params: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string'
            },
            limit: { type: 'integer' }
          }
        },
        response: {
          ...successResponse(successProjectEvidences),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getProjectEvidences
  }
};

const routes = {
  ...basicInformationRoutes,
  ...projectDetailsRoutes,
  ...projectThumbnailRoutes,
  ...projectDetailRoutes,
  ...projectProposalRoutes,
  ...projectMilestonesRoute,
  ...commonProjectRoutes,
  ...projectExperienceRoutes,
  ...projectStatusRoutes,
  ...featuredProjectsRoutes,
  ...adminRoutes,
  ...projectTransactionsRoutes,
  ...changelogRoutes,
  ...evidencesRoutes
};

module.exports = routes;
