/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const { injectMocks } = require('../../rest/util/injection');
const originalUserProjectService = require('../../rest/services/userProjectService');
const errors = require('../../rest/errors/exporter/ErrorExporter');

let userProjectService = Object.assign({}, originalUserProjectService);
const restoreUserProjectService = () => {
  userProjectService = Object.assign({}, originalUserProjectService);
};

const testHelper = require('../testHelper');

let dbProject = [];
let dbUser = [];
let dbRole = [];
let dbUserProject = [];

const resetDb = () => {
  dbProject = [];
  dbUser = [];
  dbUserProject = [];
  dbRole = [];
};

const projectDao = {
  findById: id => dbProject.find(project => project.id === id)
};
const userDao = {
  findById: id => dbUser.find(user => user.id === id)
};
const roleDao = {
  getRoleById: id => Promise.resolve(dbRole.find(role => role.id === id)),
  getRoleByDescription: description =>
    dbRole.find(role => role.description === description)
};

const changelogService = {
  createChangelog: jest.fn()
};

const newProject = {
  id: 1,
  status: 'new',
  owner: 1
};

const userSupporter = {
  id: 2,
  firstName: 'SupporterFirstName',
  lastName: 'SupporterLastName',
  email: 'supporter@test.com',
  address: '0x222',
  blocked: false,
  emailConfirmation: true,
  roles: [],
  isAdmin: false
};

const role1 = { id: 1, description: 'role1' };

const existentUserProject = {
  id: 109,
  roleId: 1,
  userId: 2,
  projectId: newProject.id
};

const userProject1 = {
  id: 109,
  roleId: role1.id,
  userId: 109,
  projectId: 109
};

beforeEach(() => resetDb());

describe('Testing userProjectService', () => {
  describe('Testing userProjectService signAgreement', () => {
    let userProjectDao;

    const userProjectId = 1;

    beforeAll(() => {
      userProjectDao = {
        async updateStatus({ userProject, newStatus }) {
          const toSave = Object.assign({}, userProject, { status: newStatus });
          return toSave;
        },

        async findUserProject({ userId, projectId }) {
          if (userId === -1 && projectId === -1) {
            return undefined;
          }

          if (userId === 100 && projectId === 100) {
            return testHelper.buildUserProject({
              id: userProjectId,
              userId,
              projectId,
              status: 1
            });
          }

          return testHelper.buildUserProject({
            id: userProjectId,
            userId,
            projectId,
            status: 0
          });
        },

        async findUserProjectById(id) {
          if (id === -1) {
            return undefined;
          }

          if (id === 100) {
            return testHelper.buildUserProject({
              id,
              status: 1
            });
          }

          return testHelper.buildUserProject({
            id,
            status: 0
          });
        }
      };

      injectMocks(userProjectService, {
        userProjectDao
      });
    });
    afterAll(() => restoreUserProjectService());

    it('should return a userProject object with status = 1', async () => {
      const expected = testHelper.buildUserProject({ id: userProjectId });

      const response = await userProjectService.signAgreement({
        userProjectId,
        status: 1
      });

      await expect(response).toEqual(expected);
    });

    it('should return a not found error when the userProject is undefined', async () => {
      const expected = {
        error: 'User Project relation not found',
        status: 404
      };

      const response = await userProjectService.signAgreement({
        userProjectId: -1,
        status: 1
      });

      await expect(response).toEqual(expected);
    });

    it('should return an already signed error when the userProject found has status = 1', async () => {
      const expected = { error: 'Agreement already signed', status: 409 };

      const response = await userProjectService.signAgreement({
        userProjectId: 100,
        status: 1
      });

      await expect(response).toEqual(expected);
    });
  });

  describe('Testing userProjectService getUsers', () => {
    let userProjectDao;

    const projectId = 15;
    const funderList = [
      testHelper.buildUserFunder(10),
      testHelper.buildUserFunder(8)
    ];
    const userProjects = [
      testHelper.buildUserProject({
        id: 1,
        userId: funderList[0].id,
        projectId
      }),
      testHelper.buildUserProject({
        id: 2,
        userId: funderList[1].id,
        projectId
      })
    ];

    beforeAll(() => {
      userProjectDao = {
        async getUserProjects(project) {
          if (project === projectId) {
            const newUserProjects = userProjects.map(userProject => {
              const newUserProject = { ...userProject };
              newUserProject.user = funderList.find(
                funder => funder.id === userProject.user
              );
              return newUserProject;
            });
            return newUserProjects;
          }
          return undefined;
        }
      };

      injectMocks(userProjectService, {
        userProjectDao
      });
    });

    afterAll(() => restoreUserProjectService());

    it('should return an array of userProjects related to a project', async () => {
      const response = await userProjectService.getUsers(projectId);
      const expected = [
        {
          ...testHelper.buildUserProject({
            id: 1,
            userId: funderList[0].id,
            projectId
          }),
          user: funderList[0]
        },
        {
          ...testHelper.buildUserProject({
            id: 2,
            userId: funderList[1].id,
            projectId
          }),
          user: funderList[1]
        }
      ];

      return expect(response).toEqual(expected);
    });

    it('should return an error if there are no users associated to a project', async () => {
      const response = await userProjectService.getUsers(0);
      const expected = { error: 'Users not found', status: 404 };

      return expect(response).toEqual(expected);
    });
  });

  describe('Testing userProjectService createUserProject', () => {
    let userProjectDao;

    const user = 3;
    const project = 12;
    const savedUserProjectId = 20;
    const existingUserProjectId = 1;

    beforeAll(() => {
      userProjectDao = {
        async findUserProject({ userId, projectId }) {
          if (projectId === project) {
            return undefined;
          }

          return testHelper.buildUserProject({
            id: existingUserProjectId,
            userId,
            projectId
          });
        },

        async createUserProject(userProject) {
          if (userProject.user === '') {
            throw Error('DB Error');
          }

          if (userProject.user !== user) {
            return undefined;
          }

          const savedUserProject = { ...userProject };
          savedUserProject.id = savedUserProjectId;
          return savedUserProject;
        }
      };

      injectMocks(userProjectService, {
        userProjectDao
      });
    });

    afterAll(() => restoreUserProjectService());

    it('should return a new userProject with status = 0', async () => {
      const response = await userProjectService.createUserProject(
        user,
        project
      );
      const expected = testHelper.buildUserProject({
        id: savedUserProjectId,
        userId: user,
        projectId: project,
        status: 0
      });

      return expect(response).toEqual(expected);
    });

    it('should return an existing userProject if it exists', async () => {
      const response = await userProjectService.createUserProject(user, 15);
      const expected = testHelper.buildUserProject({
        id: existingUserProjectId,
        userId: user,
        projectId: 15
      });

      return expect(response).toEqual(expected);
    });

    it('should return an error if the userProject could not be created', async () => {
      const response = await userProjectService.createUserProject(45, project);
      const expected = {
        error: 'There was an error creating the User-Project',
        status: 409
      };

      return expect(response).toEqual(expected);
    });

    it('should throw an error if the database fails to create the userProject', async () =>
      expect(userProjectService.createUserProject('', project)).rejects.toEqual(
        Error('There was an error creating the User-Project')
      ));
  });
  describe('Testing relateUserWithProject', () => {
    const userProjectDao = {
      findUserProject: ({ user, role, project }) =>
        dbUserProject.find(
          up =>
            up.userId === user && up.roleId === role && up.projectId === project
        ),
      createUserProject: up => {
        dbUserProject.push(up);
        return { ...up, id: dbUserProject.length };
      }
    };
    beforeAll(() => {
      injectMocks(userProjectService, {
        userProjectDao,
        projectDao,
        userDao,
        roleDao
      });
    });

    afterAll(() => restoreUserProjectService());

    beforeEach(() => {
      dbRole.push(role1);
      dbProject.push(newProject);
      dbUser.push(userSupporter);
      dbUserProject.push(existentUserProject);
    });
    it('should successfully relate an user with a project', async () => {
      await expect(
        userProjectService.relateUserWithProject({
          userId: userSupporter.id,
          roleId: role1.id,
          projectId: newProject.id
        })
      ).resolves.toEqual({
        id: 109,
        userId: userSupporter.id,
        roleId: role1.id,
        projectId: newProject.id
      });
    });
    it('should return the relationship if it already exists', async () => {
      await expect(
        userProjectService.relateUserWithProject({
          userId: existentUserProject.userId,
          roleId: existentUserProject.roleId,
          projectId: existentUserProject.projectId
        })
      ).resolves.toEqual(existentUserProject);
    });
    it('should throw when the given user does not exist', async () => {
      const nonExistentUserId = 99;
      await expect(
        userProjectService.relateUserWithProject({
          userId: nonExistentUserId,
          roleId: role1.id,
          projectId: newProject.id
        })
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('user', nonExistentUserId)
      );
    });
    it('should throw when the given project does not exist', async () => {
      const nonExistentProjectId = 99;
      await expect(
        userProjectService.relateUserWithProject({
          userId: userSupporter.id,
          roleId: role1.id,
          projectId: nonExistentProjectId
        })
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('project', nonExistentProjectId)
      );
    });
    it('should throw when the given role does not exist', async () => {
      const nonExistentRoleId = 99;
      await expect(
        userProjectService.relateUserWithProject({
          userId: userSupporter.id,
          roleId: nonExistentRoleId,
          projectId: newProject.id
        })
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('role', nonExistentRoleId)
      );
    });
  });
  describe('Testing removeUserProject', () => {
    const userProjectDao = {
      findUserProject: ({ user, role, project }) =>
        dbUserProject.find(
          up =>
            up.userId === user && up.roleId === role && up.projectId === project
        ),
      createUserProject: up => {
        dbUserProject.push(up);
        return { ...up, id: dbUserProject.length };
      },
      removeUserProject: id => dbUserProject.filter(up => up.id === id)
    };
    beforeAll(() => {
      injectMocks(userProjectService, {
        userProjectDao,
        projectDao,
        userDao,
        roleDao,
        changelogService
      });
    });
    beforeEach(() => {
      dbRole.push(role1);
      dbProject.push(newProject);
      dbUser.push(userSupporter);
      dbUserProject.push(existentUserProject);
    });
    afterEach(() => jest.clearAllMocks());
    it('should successfully remove the user project relationship', async () => {
      const createChangelogSpy = jest.spyOn(
        changelogService,
        'createChangelog'
      );
      await expect(
        userProjectService.removeUserProject(existentUserProject)
      ).resolves.toEqual(existentUserProject);
      expect(createChangelogSpy).toHaveBeenCalled();
    });
    it('should throw when the user project does not exist', async () => {
      const nonExistentUserProject = {
        userId: existentUserProject.userId + 99,
        roleId: existentUserProject.roleId + 99,
        projectId: existentUserProject.projectId + 99
      };
      await expect(
        userProjectService.removeUserProject(nonExistentUserProject)
      ).rejects.toThrow(
        errors.common.CantFindModelWithId(
          'user project',
          JSON.stringify(nonExistentUserProject)
        )
      );
    });
    it('should throw when there was en error deleting the user project', async () => {
      jest.spyOn(userProjectDao, 'removeUserProject').mockReturnValue([]);
      await expect(
        userProjectService.removeUserProject(existentUserProject)
      ).rejects.toThrow(errors.common.ErrorDeleting('user project'));
    });
  });
  describe('Testing getUserProjectFromRoleDescription', () => {
    const userProjectDao = {
      findUserProject: ({ user, role, project }) =>
        dbUserProject.find(
          up =>
            up.userId === user && up.roleId === role && up.projectId === project
        )
    };
    beforeAll(() => {
      injectMocks(userProjectService, {
        userProjectDao,
        roleDao
      });
    });
    beforeEach(() => {
      dbRole.push(role1);
      dbUserProject.push(userProject1);
    });
    afterEach(() => jest.clearAllMocks());
    it('should successfully return the user project given a role description', async () => {
      await expect(
        userProjectService.getUserProjectFromRoleDescription({
          userId: userProject1.userId,
          projectId: userProject1.projectId,
          roleDescription: role1.description
        })
      ).resolves.toEqual(userProject1);
    });
    it('should throw when the role was not found', async () => {
      const unexistentRoleDescription = 'notARoleDescription';
      await expect(
        userProjectService.getUserProjectFromRoleDescription({
          userId: userProject1.userId,
          projectId: userProject1.projectId,
          roleDescription: unexistentRoleDescription
        })
      ).rejects.toThrow(errors.common.ErrorGetting('role'));
    });
    it('should throw when the user project was not found', async () => {
      await expect(
        userProjectService.getUserProjectFromRoleDescription({
          userId: userProject1.userId,
          projectId: userProject1.projectId + 11,
          roleDescription: role1.description
        })
      ).rejects.toThrow(errors.user.UserNotRelatedToTheProjectAndRole);
    });
  });
});
