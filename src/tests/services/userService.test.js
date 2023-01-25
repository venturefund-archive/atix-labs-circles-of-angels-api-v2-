/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const { coa, ethers } = require('hardhat');
const { injectMocks } = require('../../rest/util/injection');
const { userRoles, projectStatuses } = require('../../rest/util/constants');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const COAError = require('../../rest/errors/COAError');
const originalUserService = require('../../rest/services/userService');

let userService = Object.assign({}, originalUserService);
const restoreUserService = () => {
  userService = Object.assign({}, originalUserService);
};

const mailService = {
  sendMail: jest.fn(),
  sendSignUpMail: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendInitialUserResetPassword: jest.fn()
};

const daoService = {
  getDaos: jest.fn(() => [])
};

const buildProjectModel = id => ({ project: { id } });

describe('Testing userService', () => {
  let dbProject = [];
  let dbUser = [];
  let dbCountry = [];
  let dbUserWallet = [];
  let dbUserProject = [];

  const resetDb = () => {
    dbProject = [];
    dbUser = [];
    dbCountry = [];
    dbUserWallet = [];
    dbUserProject = [];
  };

  // USERS
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR,
    roles: []
  };

  const userSupporter = {
    id: 2,
    firstName: 'SupporterFirstName',
    lastName: 'SupporterLastName',
    email: 'supporter@test.com',
    address: '0x222',
    blocked: false,
    emailConfirmation: true,
    role: userRoles.PROJECT_SUPPORTER,
    roles: [],
    isAdmin: false,
    pin: false,
    first: true,
    apiKey: 'supporterapikey',
    apiSecret: 'supporterapisecret'
  };

  const userSupporterWallet = {
    user: 2,
    address: '0x222',
    encryptedWallet: '{}',
    mnemonic: 'test',
    roles: []
  };

  const userAdmin = {
    id: 3,
    email: 'admin@test.com',
    emailConfirmation: true,
    role: userRoles.COA_ADMIN,
    roles: [],
    isAdmin: true,
    apiKey: 'adminapikey',
    apiSecret: 'adminapisecret'
  };

  const blockedUser = {
    email: 'blocked@test.com',
    id: 4,
    firstName: 'BlockedFirstName',
    lastName: 'BlockedLastName',
    blocked: true,
    isAdmin: false,
    roles: []
  };

  // PROJECTS
  const newProject = {
    id: 1,
    status: projectStatuses.NEW,
    owner: userEntrepreneur.id
  };

  const executingProject = {
    id: 2,
    status: projectStatuses.EXECUTING,
    owner: userEntrepreneur.id
  };

  // COUNTRIES
  const argentinaCountry = {
    id: 1,
    name: 'Argentina'
  };

  // PROJECTS
  const projectIds = [1, 2, 3];
  const projects = projectIds.map(buildProjectModel);

  const ROLE_1 = 1;

  const adminUser = {
    id: 1,
    firstName: 'User',
    lastName: 'Admin',
    email: 'admin@admin.com',
    isAdmin: true,
    country: 1,
    address: 'address',
    encryptedWallet: '{}',
    mnemonic: 'mnemonic'
  };
  const regularUser = {
    ...adminUser,
    id: 2,
    isAdmin: false,
    projectId: newProject.id.toString(),
    projectRole: ROLE_1
  };

  // USER WALLET
  const userWallet1 = {
    user: 1,
    wallet: 'wallet',
    mnemonic: 'mnemonic',
    iv: 'iv',
    address: 'address'
  };

  const userDao = {
    findById: id => dbUser.find(user => user.id === id),
    getFollowedProjects: id => {
      const userFound = dbUser.find(user => user.id === id);
      if (!userFound) {
        return undefined;
      }
      // userFound.following = [newProject, executingProject];
      return { ...userFound, following: [newProject, executingProject] };
    },
    getAppliedProjects: id => {
      const userFound = dbUser.find(user => user.id === id);
      if (!userFound) {
        return undefined;
      }
      // userFound.funding = [newProject];
      // userFound.monitoring = [executingProject];
      return {
        ...userFound,
        funding: [newProject],
        monitoring: [executingProject]
      };
    },
    getUserByEmail: email => dbUser.find(user => user.email === email),
    getUserByAPIKey: apiKey => dbUser.find(user => user.apiKey === apiKey),
    createUser: user => {
      const created = { ...user, id: dbUser.length + 1 };
      dbUser.push(created);
      return created;
    },
    getUsers: () => dbUser.filter(user => !user.blocked),
    getUsersByProject: projectId =>
      dbUser
        .filter(user => user.roles.some(roles => roles.project === projectId))
        .map(user => ({
          ...user,
          roles: user.roles.filter(({ project }) => project === projectId)
        })),
    removeUserById: jest.fn(),
    updateUser: (id, fields) => {
      const found = dbUser.find(user => user.id === id);
      dbUser = dbUser
        .filter(user => user.id === id)
        .concat({
          ...found,
          ...fields
        });
      return found;
    }
  };

  const userWalletDao = {
    updateWallet: jest.fn(),
    createUserWallet: (wallet, isActive) => {
      const created = {
        ...wallet,
        id: dbUserWallet.length + 1,
        active: isActive
      };
      dbUserWallet.push(created);
      return created;
    },
    findByAddress: address => {
      const userWalletSelected = dbUserWallet.find(
        userWallet => userWallet.address === address
      );
      if (!userWalletSelected) {
        return undefined;
      }
      const user = dbUser.find(us => us.id === userWalletSelected.user);
      return user;
    },
    findByAddresses: addresses => {
      if (!dbUserWallet.length) return [];
      const userIds = dbUserWallet
        .filter(userWallet => addresses.includes(userWallet.address))
        .map(userWallet => userWallet.userId);
      const users = dbUser.filter(us => userIds.includes(us.id));
      return users;
    },
    removeUserWalletByUser: jest.fn(),
    findActiveByUserId: userId =>
      dbUserWallet.find(wallet => wallet.user === userId)
  };

  const userProjectDao = {
    getProjectsOfUser: () => Promise.resolve(projects),
    getUserProject: ({ user, project }) =>
      dbUserProject.find(
        up => up.userId === user && up.projectId === project
      ) || [],
    createUserProject: ({ user, project, role }) =>
      dbUserProject.push({ userId: user, projectId: project, roleId: role }),
    findUserProject: ({ user, project }) =>
      dbUserProject.find(
        up => up.userId === user && up.projectId === project
      ) || []
  };

  const projectService = {
    getProjectsByOwner: owner =>
      dbProject.filter(project => project.owner === owner),
    getProjectById: id => dbProject.filter(project => project.id === id)
  };

  const countryService = {
    getCountryById: id => {
      const found = dbCountry.find(country => country.id === id);
      if (!found) {
        throw new COAError(errors.common.CantFindModelWithId('country', id));
      }
      return found;
    }
  };

  const userProjectService = {
    getUserPopulatedProjects: jest.fn(() => Promise.resolve([]))
  };

  const projectDao = {
    getLastValidReview: jest.fn(() => Promise.resolve([]))
  };

  beforeEach(() => resetDb());

  describe('Testing getUserById', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUserWallet.push(userSupporterWallet);
      dbUser.push(userSupporter);
    });

    it('should return the existing user', async () => {
      const response = await userService.getUserById(userSupporter.id);
      expect(response).toEqual(userSupporter);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(userService.getUserById(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('user', 0)
      );
    });
  });

  describe('Testing login', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao,
        daoService,
        userWalletDao,
        userProjectDao,
        userProjectService,
        projectDao
      });
      bcrypt.compare = jest.fn();
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUser.push(userSupporter, blockedUser, userAdmin);
    });

    it('should return an object with the authenticated user information if the password matches', async () => {
      bcrypt.compare.mockReturnValueOnce(true);
      const response = await userService.login(
        userSupporter.email,
        'correctPass123*'
      );

      expect(response).toHaveProperty('id', userSupporter.id);
      expect(response).toHaveProperty('email', userSupporter.email);
      expect(response).toHaveProperty('isAdmin', userSupporter.isAdmin);
      expect(response).toHaveProperty('firstName', userSupporter.firstName);
      expect(response).toHaveProperty('lastName', userSupporter.lastName);
      expect(response).toHaveProperty('hasDao', userSupporter.hasDao);
      expect(response).toHaveProperty('projects', []);
      expect(response).toHaveProperty('pin', userSupporter.pin);
      expect(response).toHaveProperty('first', userSupporter.first);
    });

    it('should return zero projects when it is an admin', async () => {
      bcrypt.compare.mockReturnValueOnce(true);
      const response = await userService.login(
        userAdmin.email,
        'correctPass123*'
      );

      expect(response.projects.length).toEqual(0);
    });

    it('should throw an error if a user has never confirm email address', async () => {
      await expect(
        userService.login(userSupporter.email, 'correctPass123*')
      ).rejects.toThrow(errors.user.InvalidUserOrPassword);
    });

    it('should throw an error if a user with that email does not exist', async () => {
      await expect(userService.login('', 'anyPass123*')).rejects.toThrow(
        errors.user.InvalidUserOrPassword
      );
    });

    it('should throw an error if the email and password does not match', async () => {
      bcrypt.compare.mockReturnValueOnce(false);
      await expect(
        userService.login(userSupporter.email, 'wrongPass123*')
      ).rejects.toThrow(errors.user.InvalidUserOrPassword);
    });

    it(
      'should throw an error if the credentials were correct ' +
        'but the user is blocked',
      async () => {
        bcrypt.compare.mockReturnValueOnce(true);
        await expect(
          userService.login(blockedUser.email, 'correctPass123*')
        ).rejects.toThrow(errors.user.UserRejected);
      }
    );
  });

  describe('Testing API login', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao,
        daoService,
        userWalletDao,
        userProjectDao
      });
      bcrypt.compare = jest.fn();
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUser.push(userSupporter, blockedUser, userAdmin);
    });

    it('should return an object with the authenticated user information if API key and secret matches', async () => {
      bcrypt.compare.mockReturnValueOnce(true);
      const response = await userService.loginAPI(
        userSupporter.apiKey,
        userSupporter.apiSecret
      );

      expect(response).toHaveProperty('id', userSupporter.id);
      expect(response).toHaveProperty('email', userSupporter.email);
      expect(response).toHaveProperty('isAdmin', userSupporter.isAdmin);
      expect(response).toHaveProperty('firstName', userSupporter.firstName);
      expect(response).toHaveProperty('lastName', userSupporter.lastName);
      expect(response).toHaveProperty('hasDao', userSupporter.hasDao);
      expect(response).toHaveProperty('projects', []);
      expect(response).toHaveProperty('pin', userSupporter.pin);
      expect(response).toHaveProperty('first', userSupporter.first);
    });

    it('should return zero projects when it is an admin', async () => {
      bcrypt.compare.mockReturnValueOnce(true);
      const response = await userService.loginAPI(
        userAdmin.apiKey,
        userAdmin.apiSecret
      );

      expect(response.projects.length).toEqual(0);
    });

    it('should throw an error if a user with that email does not exist', async () => {
      await expect(userService.loginAPI('', 'anySecret')).rejects.toThrow(
        errors.user.InvalidAPIKeyOrSecret
      );
    });

    it('should throw an error if the email and password does not match', async () => {
      bcrypt.compare.mockReturnValueOnce(false);
      await expect(
        userService.loginAPI(userSupporter.apiKey, 'NonMatchingSecret')
      ).rejects.toThrow(errors.user.InvalidAPIKeyOrSecret);
    });
  });

  describe('Testing createUser', () => {
    const newUser = {
      firstName: 'NewFirstName',
      lastName: 'NewLastName',
      email: 'new@email.com',
      password: 'newPass123*',
      role: userRoles.ENTREPRENEUR,
      country: 1,
      phoneNumber: '12345678',
      answers: JSON.stringify({
        'Question?': 'Test',
        'Another question?': 'OK'
      }),
      company: 'AtixLabs',
      address: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
      encryptedWallet: '{ "address": 65dqw6sa9787a }',
      mnemonic: 'fast envelope asd asd asd asd asd'
    };

    beforeAll(() => {
      bcrypt.hash = jest.fn();
      coa.migrateMember = jest.fn();
      const addUser = jest.fn();
      coa.getWhitelist = jest.fn().mockReturnValue({
        addUser
      });
      const sendTransaction = jest.fn();
      ethers.signers = jest.fn(() => [
        {
          sendTransaction
        }
      ]);
      injectMocks(userService, {
        userDao,
        mailService,
        countryService,
        userWalletDao
      });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbCountry.push(argentinaCountry);
    });

    it("should return an object with the new user's information", async () => {
      bcrypt.hash.mockReturnValueOnce(newUser.password);
      const response = await userService.createUser(newUser);
      expect(response).toEqual({
        ...newUser,
        id: 1
      });

      const created = dbUser.find(user => user.id === response.id);
      expect(created).toBeDefined();
      expect(mailService.sendEmailVerification).toHaveBeenCalled();
    });

    it('should return an error if any required param is missing', async () => {
      await expect(
        userService.createUser({
          firstName: 'NewFirstName',
          lastName: 'NewLastName',
          email: 'new@email.com',
          isAdmin: true,
          country: 1
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createUser'));
    });
    it('should return an error if a user exists with the same email', async () => {
      dbUser.push(userSupporter);
      await expect(
        userService.createUser({ ...newUser, email: userSupporter.email })
      ).rejects.toThrow(errors.user.EmailAlreadyInUse);
    });
    it('should return an error if the country provided does not exist', async () => {
      await expect(
        userService.createUser({ ...newUser, country: 0 })
      ).rejects.toThrow(errors.common.CantFindModelWithId('country', 0));
    });
    it("should return an object with the new user's information with phoneNumber null", async () => {
      bcrypt.hash.mockReturnValueOnce(newUser.password);
      const userWithNoPhoneNumber = Object.assign(newUser, {
        phoneNumber: null
      });
      const response = await userService.createUser(userWithNoPhoneNumber);
      expect(response).toEqual({
        ...newUser,
        id: 1
      });
    });
    it('should whitelist the user', async () => {
      await userService.createUser(newUser);
      expect(coa.getWhitelist().addUser).toBeCalledWith(newUser.address);
    });
  });

  describe('Testing getUsers', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao,
        userWalletDao
      });
    });
    afterAll(() => restoreUserService());

    it('should return a list with all existing', async () => {
      dbUser.push(userEntrepreneur, userSupporter, userAdmin);
      const response = await userService.getUsers();
      expect(response).toHaveLength(3);
      expect(response).toEqual([
        {
          id: 1,
          role: userRoles.ENTREPRENEUR,
          projects: []
        },
        {
          id: 2,
          firstName: 'SupporterFirstName',
          lastName: 'SupporterLastName',
          role: userRoles.PROJECT_SUPPORTER,
          email: 'supporter@test.com',
          address: '0x222',
          blocked: false,
          emailConfirmation: true,
          first: true,
          isAdmin: false,
          projects: [],
          pin: false,
          apiKey: 'supporterapikey',
          apiSecret: 'supporterapisecret'
        },
        {
          id: 3,
          email: 'admin@test.com',
          emailConfirmation: true,
          role: userRoles.COA_ADMIN,
          isAdmin: true,
          projects: [],
          apiKey: 'adminapikey',
          apiSecret: 'adminapisecret'
        }
      ]);
    });

    it('should return an empty array if no users were found', async () => {
      const response = await userService.getUsers();
      expect(response).toHaveLength(0);
    });

    it('should return a list with all existing with formated roles and filter blocked users', async () => {
      dbUser.push(
        {
          ...userAdmin,
          isAdmin: true,
          roles: [
            { project: 1, user: 3, role: 1 },
            { project: 1, user: 3, role: 2 },
            { project: 2, user: 3, role: 3 }
          ]
        },
        { ...userEntrepreneur, roles: [{ project: 3, user: 3, role: 3 }] },
        { ...userSupporter, blocked: true }
      );
      const response = await userService.getUsers();
      expect(response).toHaveLength(2);

      const { roles, ...userAdminWithoutRoles } = userAdmin;
      const { roles: _, ...userEntrepreneurWithoutRoles } = userEntrepreneur;
      expect(response).toEqual([
        {
          ...userAdminWithoutRoles,
          isAdmin: true,
          projects: [
            { projectId: '1', roles: [1, 2] },
            { projectId: '2', roles: [3] }
          ]
        },
        {
          ...userEntrepreneurWithoutRoles,
          projects: [{ projectId: '3', roles: [3] }]
        }
      ]);
    });
  });

  describe('Testing getProjectsOfUser', () => {
    beforeAll(() => {
      injectMocks(userService, {
        projectService,
        userDao,
        userWalletDao
      });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbUser.push(userEntrepreneur, userSupporter, userAdmin);
    });

    it('should return the array of projects belonging to the entrepreneur', async () => {
      const response = await userService.getProjectsOfUser(userEntrepreneur.id);
      expect(response).toHaveLength(2);
    });

    it('should return the array of projects related to the supporter', async () => {
      // TODO: add functionality to actual method
      const response = await userService.getProjectsOfUser(userSupporter.id);
      expect(response).toHaveLength(0);
    });

    it('should return an empty array if the user is not a supporter or entrepreneur', async () => {
      const response = await userService.getProjectsOfUser(userAdmin.id);
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getFollowedProjects', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUser.push(userSupporter);
      dbUserWallet.push(userSupporterWallet);
    });

    it('should return the array of followed projects belonging to the user', async () => {
      const response = await userService.getFollowedProjects({
        userId: userSupporter.id
      });

      expect(response).toHaveLength(2);
    });

    it("should fail if user doesn't exist", async () => {
      expect(userService.getFollowedProjects({ userId: 10 })).rejects.toThrow(
        errors.user.UserNotFound
      );
    });
  });

  describe('Testing getAppliedProjects', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });

    beforeEach(() => {
      dbUserWallet.push(userSupporterWallet);
      dbUser.push(userSupporter);
    });

    it('should return the array of applied projects belonging to the user', async () => {
      const response = await userService.getAppliedProjects({
        userId: userSupporter.id
      });

      expect(response.monitoring).toHaveLength(1);
      expect(response.funding).toHaveLength(1);
    });

    it("should fail if user doesn't exist", async () => {
      expect(userService.getAppliedProjects({ userId: 10 })).rejects.toThrow(
        errors.user.UserNotFound
      );
    });
  });

  describe('Testing validUser', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao,
        userWalletDao
      });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => dbUser.push(userSupporter, blockedUser));

    it(
      'should return true if the user exists, is not blocked ' +
        'and the role is the same',
      async () => {
        await expect(userService.validUser(userSupporter)).resolves.toBe(true);
      }
    );

    it(
      'should return false if the user exists, is not blocked ' +
        'but the role is not the same',
      async () => {
        await expect(userService.validUser(userSupporter, true)).resolves.toBe(
          false
        );
      }
    );

    it(
      'should return false if the user exists, the role is the same ' +
        'but is blocked',
      async () => {
        await expect(
          userService.validUser(blockedUser, userRoles.PROJECT_SUPPORTER)
        ).resolves.toBe(false);
      }
    );

    it('should throw an error if the user does not exist', async () => {
      await expect(
        userService.validUser({ id: 0 }, userRoles.PROJECT_SUPPORTER)
      ).rejects.toThrow(errors.common.CantFindModelWithId('user', 0));
    });
  });

  describe('Testing getUserByAddress method', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());
    beforeEach(() => {
      dbUser.push(userSupporter);
      dbUserWallet.push(userSupporterWallet);
    });
    it('should return the existing user', async () => {
      const response = await userService.getUserByAddress(
        userSupporterWallet.address
      );
      expect(response).toEqual(userSupporter);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(userService.getUserByAddress('0x')).rejects.toThrow(
        errors.common.CantFindModelWithAddress('user', '0x')
      );
    });
  });

  describe('Testing updatePassword', () => {
    const userDao2 = {
      ...userDao,
      getUserById: id => dbUser.find(user => user.id === id)
    };
    beforeAll(() => {
      injectMocks(userService, { userDao: userDao2, userWalletDao });
    });
    afterAll(() => restoreUserService());

    test('Invalid id should return false', async () => {
      const response = await userService.updatePassword(
        100000,
        'correctPass123*',
        {}
      );
      expect(response).toBe(false);
    });
  });

  describe('Testing getVotersByAddresses', () => {
    const voterUser1 = {
      id: 1,
      firstName: 'voter',
      lastName: '1'
    };
    const voterUser2 = {
      id: 2,
      firstName: 'voter',
      lastName: '2'
    };
    const voterUser3 = {
      id: 3,
      firstName: 'voter',
      lastName: '3'
    };
    const userWallet1 = {
      id: 10,
      userId: 1,
      address: '0x221'
    };
    const userWallet2 = {
      id: 11,
      userId: 2,
      address: '0x222'
    };
    const userWallet3 = {
      id: 12,
      userId: 3,
      address: '0x223'
    };
    const userAddresses = [
      userWallet1.address,
      userWallet2.address,
      userWallet3.address
    ];
    beforeEach(() => {
      dbUser.push(voterUser1, voterUser2, voterUser3);
      dbUserWallet.push(userWallet1, userWallet2, userWallet3);
    });
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());

    it('should return all user short names', async () => {
      const response = await userService.getVotersByAddresses(userAddresses);
      expect(response).toEqual(['v1', 'v2', 'v3']);
    });

    it('should return only first user short name', async () => {
      const response = await userService.getVotersByAddresses(['0x221']);
      expect(response).toEqual(['v1']);
    });

    it('should return empty array', async () => {
      const response = await userService.getVotersByAddresses(['0x0001']);
      expect(response).toEqual([]);
    });
  });

  describe('Testing getUserByEmail method', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());
    beforeEach(() => {
      dbUser.push({
        ...userSupporter,
        roles: [
          { project: 1, user: 2, role: 3 },
          { project: 1, user: 2, role: 4 },
          { project: 2, user: 2, role: 1 },
          { project: 2, user: 2, role: 2 }
        ]
      });
    });
    it('should return the existing user by email with formated roles', async () => {
      const response = await userService.getUserByEmail(userSupporter.email);
      expect(response).toEqual({
        id: 2,
        firstName: 'SupporterFirstName',
        lastName: 'SupporterLastName',
        role: userRoles.PROJECT_SUPPORTER,
        email: 'supporter@test.com',
        address: '0x222',
        blocked: false,
        emailConfirmation: true,
        first: true,
        isAdmin: false,
        projects: [
          { projectId: '1', roles: [3, 4] },
          { projectId: '2', roles: [1, 2] }
        ],
        pin: false,
        apiKey: 'supporterapikey',
        apiSecret: 'supporterapisecret'
      });
    });
  });

  describe('Testing getUsersProject method', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao, userWalletDao });
    });
    afterAll(() => restoreUserService());
    beforeEach(() => {
      dbUser.push(
        {
          ...userSupporter,
          roles: [
            { project: 1, user: 2, role: 3 },
            { project: 1, user: 2, role: 4 },
            { project: 2, user: 2, role: 1 },
            { project: 2, user: 2, role: 2 }
          ]
        },
        {
          ...userAdmin,
          isAdmin: true,
          roles: [
            { project: 2, user: 2, role: 3 },
            { project: 2, user: 2, role: 2 }
          ]
        }
      );
    });
    it('should return the existing user by email with formated roles', async () => {
      const response = await userService.getUsersByProject(2);
      const { roles, ...userSupporterWithoutRoles } = userSupporter;
      const { roles: _, ...userAdminWithoutRoles } = userAdmin;
      expect(response).toMatchObject([
        {
          ...userSupporterWithoutRoles,
          projects: [{ projectId: '2', roles: [1, 2] }]
        },
        {
          ...userAdminWithoutRoles,
          isAdmin: true,
          projects: [{ projectId: '2', roles: [3, 2] }]
        }
      ]);
    });
  });
  describe('Testing newCreateUser', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      restoreUserService();
      injectMocks(userService, {
        userDao,
        userWalletDao,
        projectService,
        userProjectDao,
        mailService
      });
      dbProject.push(newProject);
      dbUser.push({ email: 'existingemail' });
    });
    afterAll(() => restoreUserService());
    it('should create an admin user', async () => {
      await expect(userService.newCreateUser(adminUser)).resolves.toEqual({
        id: dbUser.length + 1
      });
    });
    it('should create a regular user', async () => {
      await expect(userService.newCreateUser(regularUser)).resolves.toEqual({
        id: dbUser.length + 1
      });
    });
    it('should throw when user already exists', async () => {
      await expect(
        userService.newCreateUser({ ...adminUser, email: 'existingemail' })
      ).rejects.toThrow(errors.user.EmailAlreadyInUse);
    });
  });
  describe('Testing sendWelcomeEmail', () => {
    const passRecovery = {
      email: 'admin@admin.com',
      token: 'token',
      createdAt: new Date().toString(),
      expirationDate: new Date().toString(),
      id: 1
    };

    const passRecoveryDao = {
      createRecovery: () => passRecovery
    };
    beforeAll(() => {
      injectMocks(userService, {
        userDao,
        userWalletDao,
        passRecoveryDao,
        projectService,
        userProjectDao,
        mailService
      });
    });
    beforeEach(() => {
      dbProject.push(newProject);
      dbUser.push(regularUser, adminUser);
      dbUserProject.push({
        projectId: newProject.id.toString(),
        userId: regularUser.id
      });
      jest.resetAllMocks();
    });
    afterAll(() => restoreUserService());
    it('should successfully send the welcome email when a projectId is provided', async () => {
      await expect(
        userService.sendWelcomeEmail(regularUser.id, newProject.id.toString())
      ).resolves.not.toThrow();
      expect(mailService.sendInitialUserResetPassword).toHaveBeenCalled();
    });
    it('should successfully send the welcome email when no projectId is provided', async () => {
      await expect(
        userService.sendWelcomeEmail(adminUser.id)
      ).resolves.not.toThrow();
      expect(mailService.sendInitialUserResetPassword).toHaveBeenCalled();
    });
    it('should throw when there is no user related to the userId', async () => {
      const nonExistentUserId = regularUser.id + 99999;
      await expect(
        userService.sendWelcomeEmail(nonExistentUserId)
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('user', nonExistentUserId)
      );
      expect(mailService.sendInitialUserResetPassword).not.toHaveBeenCalled();
    });
    it('should throw when a projectId is provided but the user is not related to the project', async () => {
      await expect(
        userService.sendWelcomeEmail(adminUser.id, newProject.id)
      ).rejects.toThrow(errors.user.UserNotRelatedToTheProject);
      expect(mailService.sendInitialUserResetPassword).not.toHaveBeenCalled();
    });
    it('should throw when token could not be created', async () => {
      restoreUserService();
      injectMocks(userService, {
        userDao,
        userWalletDao,
        passRecoveryDao: { createRecovery: () => undefined },
        projectService,
        userProjectDao,
        mailService
      });
      await expect(
        userService.sendWelcomeEmail(2, newProject.id.toString())
      ).rejects.toThrow(errors.user.TokenNotCreated);
      expect(mailService.sendInitialUserResetPassword).not.toHaveBeenCalled();
    });
  });
  describe('Testing setPin', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao
      });
    });
    beforeEach(() => {
      dbUser.push(regularUser);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => restoreUserService());
    it('should successfully set user pin to true', async () => {
      const updateUserSpy = jest.spyOn(userDao, 'updateUser');
      await expect(userService.setPin(regularUser.id)).resolves.toEqual({
        success: true
      });
      expect(updateUserSpy).toHaveBeenCalledWith(regularUser.id, {
        pin: true
      });
    });
    it('should throw when updateUser does not return', async () => {
      jest.spyOn(userDao, 'updateUser').mockReturnValue(undefined);
      await expect(userService.setPin(regularUser.id)).rejects.toThrow(
        errors.user.UserUpdateError
      );
    });
    it('should throw when user does not exist', async () => {
      await expect(userService.setPin(adminUser.id)).rejects.toThrow(
        errors.common.CantFindModelWithId('user', adminUser.id)
      );
    });
  });
  describe('Testing createWallet', () => {
    beforeAll(() => {
      jest.clearAllMocks();
      injectMocks(userService, {
        userWalletDao,
        userDao
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => restoreUserService());
    it('should successfully create user wallet', async () => {
      const updateUserSpy = jest
        .spyOn(userDao, 'updateUser')
        .mockResolvedValue({ id: 2 });
      await expect(
        userService.createWallet(regularUser.id, userWallet1)
      ).resolves.toEqual({
        id: dbUserWallet.length + 1
      });
      expect(updateUserSpy).toHaveBeenCalledWith(regularUser.id, {
        address: userWallet1.address
      });
    });
    it('should return the user wallet when it already has one', async () => {
      dbUserWallet = [];
      dbUserWallet.push({ ...userWallet1, id: 1 });
      const creatUserSpy = jest.spyOn(userWalletDao, 'createUserWallet');
      const updateUserSpy = jest.spyOn(userDao, 'updateUser');
      await expect(
        userService.createWallet(userWallet1.user, userWallet1)
      ).resolves.toEqual({
        id: 1
      });
      expect(creatUserSpy).not.toHaveBeenCalled();
      expect(updateUserSpy).not.toHaveBeenCalled();
    });
    it('should throw when creating user wallet fails', async () => {
      jest
        .spyOn(userWalletDao, 'createUserWallet')
        .mockResolvedValue(undefined);
      await expect(
        userService.createWallet(regularUser.id, userWallet1)
      ).rejects.toThrow(errors.userWallet.NewWalletNotSaved);
    });
  });

  describe('Testing updateApiKeyAndSecret', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
    });
    beforeEach(() => {
      dbUser.push(userSupporter);
    });
    afterAll(() => restoreUserService());

    test('userDao.updateUser should be called with right parameters', async () => {
      const apiKey = 'some-api-key';
      const apiSecret = 'some-api-secret';
      await userService.updateApiKeyAndSecret(
        userSupporter.id,
        apiKey,
        apiSecret
      );

      expect(userDao.updateUser).toHaveBeenCalledWith(userSupporter.id, {
        apiKey,
        apiSecret
      });
    });

    test('Should return true if user is updated', async () => {
      const response = await userService.updateApiKeyAndSecret(
        userSupporter.id,
        'some-api-key',
        'some-secret-key'
      );

      expect(response).toBe(true);
    });
  });
});
