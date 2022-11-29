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
const { projectStatuses } = require('../util/constants');
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
        id: { type: 'integer' },
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
  additionalCurrencyInformation: { type: 'string' }
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

const projectIdParam = idParam('Project identification', 'projectId');

const successWithProjectIdResponse = {
  type: 'object',
  properties: {
    projectId: { type: 'integer' }
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
    projectId: { type: 'integer' }
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
      proposal: { type: 'string' },
      faqLink: { type: 'string' },
      coverPhotoPath: { type: 'string' },
      cardPhotoPath: { type: 'string' },
      milestonePath: { type: 'string' },
      goalAmount: { type: 'number' },
      currency: { type: 'string' },
      status: { type: 'string' },
      owner: userResponse,
      createdAt: { type: 'string' },
      proposalFilePath: { type: 'string' },
      agreementFilePath: { type: 'string' },
      id: { type: 'number' },
      nextStatusUpdateAt: { type: 'string' },
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
      }
    }
  },
  description: 'Returns all projects'
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
  updateBasicProjectInformation: {
    method: 'put',
    path: `${basePath}/:projectId/basic-information`,
    options: {
      beforeHandler: ['adminAuth'],
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
      beforeHandler: ['adminAuth'],
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
              type: 'integer',
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
  sendToReview: {
    method: 'put',
    path: `${basePath}/:projectId/to-review`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.PROJECT.name, routeTags.PUT.name],
        description: 'Send a project to be reviewed',
        summary: 'Send a project to be reviewed',
        params: projectIdParam,
        response: {
          ...successResponse(successWithProjectIdResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendToReview
  },

  publishProject: {
    method: 'put',
    path: `${basePath}/:projectId/publish`,
    options: {
      beforeHandler: ['adminAuth'],
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
  ...adminRoutes
};

module.exports = routes;
