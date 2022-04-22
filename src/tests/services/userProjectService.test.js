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

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config')
};

const testHelper = require('../testHelper');

describe('Testing userProjectService signAgreement', () => {
  let userProjectDao;
  let userProjectService;

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

    userProjectService = require('../../rest/services/userProjectService');
    injectMocks(userProjectService, {
      userProjectDao
    });
  });

  it('should return a userProject object with status = 1', async () => {
    const expected = testHelper.buildUserProject({ id: userProjectId });

    const response = await userProjectService.signAgreement({
      userProjectId,
      status: 1
    });

    await expect(response).toEqual(expected);
  });

  it('should return a not found error when the userProject is undefined', async () => {
    const expected = { error: 'User Project relation not found', status: 404 };

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
  let userProjectService;

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

    userProjectService = require('../../rest/services/userProjectService');
    injectMocks(userProjectService, {
      userProjectDao
    });
  });

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
  let userProjectService;

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

    userProjectService = require('../../rest/services/userProjectService');
    injectMocks(userProjectService, {
      userProjectDao
    });
  });

  it('should return a new userProject with status = 0', async () => {
    const response = await userProjectService.createUserProject(user, project);
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
