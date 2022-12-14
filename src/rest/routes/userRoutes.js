/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/users';
const handlers = require('./handlers/userHandlers');
const routeTags = require('../util/routeTags');
const {
  successResponse,
  serverErrorResponse,
  clientErrorResponse
} = require('../util/responses');

const userProperties = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  address: { type: 'string' },
  createdAt: { type: 'string' },
  role: { type: 'string' },
  id: { type: 'string' },
  hasDaos: { type: 'boolean' },
  isAdmin: { type: 'boolean' },
  forcePasswordChange: { type: 'boolean' },
  first: { type: 'boolean' },
  pin: { type: 'boolean' },
  blocked: { type: 'boolean' },
  emailConfirmation: { type: 'boolean' },
  phoneNumber: { type: 'string' },
  answers: { type: 'string' },
  company: { type: 'string' },
  country: {
    anyOf: [
      { type: 'number' },
      {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      }
    ]
  },
  projects: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        projectId: { type: 'number' },
        roles: {
          type: 'array',
          items: { type: 'number' }
        }
      }
    }
  }
};

const userResponse = {
  type: 'object',
  properties: userProperties,
  description: "User's information"
};

const successWithMessageResponse = {
  type: 'object',
  properties: {
    success: { type: 'string' }
  },
  description: 'Returns a success message if the user was signed up correctly'
};

const successUserCreateResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  },
  description: 'Returns a success message if the user was created correctly'
};

const successWithUserResponse = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: userResponse
    }
  },
  description: 'Returns an array of objects with the users information'
};

const successPasswordUpdated = {
  type: 'object',
  properties: {
    success: { type: 'string' }
  },
  description: 'Returns a success message if the password was changed'
};

const successPasswordReset = {
  type: 'object',
  properties: {
    first: { type: 'boolean' }
  },
  description: 'Returns the first user password change'
};

const successBoolean = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean'
    }
  }
};

const successTokenStatus = {
  type: 'object',
  properties: {
    expired: {
      type: 'boolean'
    }
  }
};

const successMailSent = {
  type: 'object',
  properties: {
    email: { type: 'string' }
  },
  description: 'Returns the email to where the recovery password was sent'
};

const successWithWalletResponse = {
  type: 'object',
  properties: {
    wallet: { type: 'string', description: 'String of the encrypted wallet' }
  }
};

const successWithMnemonicResponse = {
  type: 'string',
  description: 'Returns the mnemonic of the wallet'
};

const projectResponse = {
  projectName: { type: 'string' },
  mission: { type: 'string' },
  problemAddressed: { type: 'string' },
  location: { type: 'string' },
  timeframe: { type: 'string' },
  proposal: { type: 'string' },
  faqLink: { type: 'string' },
  coverPhotoPath: { type: 'string' },
  cardPhotoPath: { type: 'string' },
  goalAmount: { type: 'number' },
  status: { type: 'string' },
  owner: { type: 'string' },
  createdAt: { type: 'string' },
  transactionHash: { type: 'string' },
  id: { type: 'number' }
};

const successWithProjectsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: projectResponse
  },
  description: 'Returns an array of objects with the projects information'
};

const appliedProjectsResponse = {
  type: 'object',
  properties: {
    funding: successWithProjectsResponse,
    monitoring: successWithProjectsResponse
  },
  description: 'Returns an object with the applied projects'
};

const routes = {
  getUser: {
    method: 'get',
    path: `${basePath}/:userId`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns an object the information of an existing user',
        summary: 'Get existing user',
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User to get the information'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              address: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              id: { type: 'string' },
              role: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              },
              encryptedWallet: { type: 'string' }
            },
            description: 'Returns and object with the user information'
          },
          '4xx': {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getUser
  },

  getUsers: {
    method: 'get',
    path: `${basePath}`,
    options: {
      beforeHandler: ['adminAuth'],
      parameters: [
        {
          name: 'email',
          in: 'query',
          description:
            'Email value optional that should need to be considered for filter',
          required: false,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'projectId',
          in: 'query',
          description:
            'Project id value optional that should need to be considered for filter',
          required: false,
          schema: {
            type: 'number'
          }
        }
      ],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns the information of all the existing COA users',
        summary: 'Get all existing users',
        response: {
          ...successResponse(successWithUserResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.getUsers
  },

  loginUser: {
    method: 'post',
    path: `${basePath}/login`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'User login by email and password',
        summary: 'User login',
        type: 'application/json',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            pwd: { type: 'string' }
          },
          required: ['email', 'pwd'],
          additionalProperties: false,
          description: 'User login information'
        },
        response: {
          ...successResponse(userResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.loginUser
  },

  signupUser: {
    method: 'post',
    path: `${basePath}/signup`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'Registers a new user in COA',
        summary: 'User sign up',
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string' },
            phoneNumber: { type: 'string' },
            country: { type: 'number' },
            answers: { type: 'string' },
            company: { type: 'string' },
            address: { type: 'string' },
            encryptedWallet: { type: 'string' },
            mnemonic: { type: 'string' }
          },
          required: [
            'firstName',
            'lastName',
            'email',
            'password',
            'role',
            'country',
            'answers',
            'address',
            'encryptedWallet',
            'mnemonic'
          ],
          additionalProperties: false,
          description: 'User on-boarding information'
        },
        response: {
          ...successResponse(successWithMessageResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.signupUser
  },

  createUser: {
    method: 'post',
    path: basePath,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'Registers a new user in COA',
        summary: 'User sign up',
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            country: { type: 'number' },
            isAdmin: { type: 'boolean' }
          },
          required: ['firstName', 'lastName', 'email', 'country', 'isAdmin'],
          additionalProperties: false,
          description: 'User on-boarding information'
        },
        response: {
          ...successResponse(successUserCreateResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createUser
  },

  recoverPassword: {
    method: 'post',
    path: `${basePath}/recoverPassword`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description:
          'Receives an email account and starts the password recovery process ' +
          'for the corresponding user, sending them an email with the instructions ' +
          'on how to proceed',
        summary: 'Start password recovery process',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            projectId: { type: 'number' }
          },
          required: ['email'],
          description: 'E-mail account of the user to recover the password'
        },
        response: {
          ...successResponse(successMailSent),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.recoverPassword
  },

  changePassword: {
    method: 'put',
    path: `${basePath}/me/password`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description: 'Modifies the password and wallet of an existing user',
        summary: 'Update user password',
        body: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            encryptedWallet: { type: 'string' }
          },
          required: ['currentPassword', 'newPassword', 'encryptedWallet'],
          description: 'New password and new encrypted wallet'
        },
        response: {
          ...successResponse(successPasswordUpdated),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.changePassword
  },

  changeRecoverPassword: {
    method: 'put',
    path: `${basePath}/me/recover-password`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description:
          'Modifies the password and wallet of an existing user that asked for recovery',
        summary: 'Update user password and wallet',
        body: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            token: { type: 'string' },
            password: { type: 'string' },
            encryptedWallet: { type: 'string' },
            mnemonic: { type: 'string' }
          },
          required: [
            'address',
            'token',
            'password',
            'encryptedWallet',
            'mnemonic'
          ],
          description: 'New password and new encrypted wallet'
        },
        response: {
          ...successResponse(successPasswordUpdated),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.changeRecoverPassword
  },

  changeResetPassword: {
    method: 'put',
    path: `${basePath}/me/reset-password`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description: 'Modifies the password and wallet of an existing user',
        summary: 'Update user password and wallet',
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['token', 'password'],
          description: 'New password and new encrypted wallet'
        },
        response: {
          ...successResponse(successPasswordReset),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.changeResetPassword
  },

  getWallet: {
    method: 'get',
    path: `${basePath}/me/wallet`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns the encrypted wallet to an existing user',
        summary: 'Get the encrpyted wallet by user',
        response: {
          ...successResponse(successWithWalletResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getWallet
  },

  getMnmemonicFromToken: {
    method: 'GET',
    path: `${basePath}/mnemonic/:token`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description:
          'Returns the mnemonics existing user when forgotten password',
        summary: 'Get the mnemonics by user',
        response: {
          ...successResponse(successWithMnemonicResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getMnemonicFromToken
  },

  getTokenStatus: {
    method: 'GET',
    path: `${basePath}/token/:token`,
    options: {
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description:
          'Returns the status of a given token used to recover a password',
        summary: 'Returns the status of a given token',
        response: {
          ...successResponse(successTokenStatus),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getTokenStatus
  },

  getMyProjects: {
    method: 'get',
    path: `${basePath}/me/projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects related to an existing user',
        summary: 'Get all projects by user',
        response: {
          ...successResponse(successWithProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getMyProjects
  },

  getFollowedProjects: {
    method: 'get',
    path: `${basePath}/followed-projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects followed to an existing user',
        summary: 'Get all followed projects by user',
        response: {
          ...successResponse(successWithProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getFollowedProjects
  },

  getAppliedProjects: {
    method: 'get',
    path: `${basePath}/applied-projects`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.GET.name],
        description: 'Returns all projects applied of an existing user',
        summary: 'Get all applied projects by user',
        response: {
          ...successResponse(appliedProjectsResponse),
          ...serverErrorResponse(),
          ...clientErrorResponse()
        }
      }
    },
    handler: handlers.getAppliedProjects
  },

  confirmEmail: {
    method: 'put',
    path: `${basePath}/:id/email/confirm`,
    options: {
      beforeHandler: [],
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description: 'Confirm user email address',
        summary: 'Update user emailVerification',
        body: {},
        response: {
          ...successResponse(userResponse),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.confirmEmail
  },

  welcomeEmail: {
    method: 'post',
    path: `${basePath}/welcome-email`,
    options: {
      beforeHandler: ['adminAuth'],
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'Sends welcome email',
        summary: 'Update user emailVerification',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            projectId: { type: 'number' }
          },
          required: ['userId']
        },
        response: {
          ...successResponse(successBoolean),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.sendWelcomeEmail
  },

  setPin: {
    method: 'put',
    path: `${basePath}/pin`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.PUT.name],
        description: 'Set user pin to true',
        summary: 'Update user pin field',
        response: {
          ...successResponse(successBoolean),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.setPin
  },

  updateWallet: {
    method: 'post',
    path: `${basePath}/wallet`,
    options: {
      beforeHandler: ['generalAuth', 'withUser'],
      schema: {
        tags: [routeTags.USER.name, routeTags.POST.name],
        description: 'Creates user wallet',
        summary: 'Creates user wallet',
        body: {
          type: 'object',
          properties: {
            wallet: { type: 'string' },
            address: { type: 'string' },
            mnemonic: { type: 'string' },
            // TODO: delete this field
            iv: { type: 'string' }
          },
          required: ['wallet', 'address', 'mnemonic', 'iv']
        },
        response: {
          ...successResponse({
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
          }),
          ...clientErrorResponse(),
          ...serverErrorResponse()
        }
      }
    },
    handler: handlers.createWallet
  }
};

module.exports = routes;
