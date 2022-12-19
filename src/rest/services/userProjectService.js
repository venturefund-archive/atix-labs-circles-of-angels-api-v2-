/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const checkExistence = require('./helpers/checkExistence');
const { rolesTypes, ACTION_TYPE } = require('../util/constants');

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
  /**
   * Receives a user id and a project id.
   *
   * Changes the status of the agreement between to signed if not already signed.
   *
   * @param {*} { userId, projectId }
   * @returns updated userProject row
   */
  async signAgreement({ userProjectId, status }) {
    const userProject = await this.userProjectDao.findUserProjectById(
      userProjectId
    );

    logger.info('[User Project Service] :: userProject found:', userProject);

    if (!userProject && userProject == null) {
      logger.info(
        '[User Project Service] :: UserProject ID not found:',
        userProjectId
      );
      return { error: 'User Project relation not found', status: 404 };
    }

    if (userProject.status === 1) {
      logger.info(
        '[User Project Service] :: Agreement already signed for:',
        userProject
      );
      return { error: 'Agreement already signed', status: 409 };
    }

    const updatedUserProject = await this.userProjectDao.updateStatus({
      userProject,
      newStatus: status
    });

    logger.info(
      '[User Project Service] :: userProject status updated:',
      updatedUserProject
    );

    return updatedUserProject;
  },

  /**
   * Gets all userProjects and the users information associated with the project id received
   *
   * @param {*} projectId
   * @returns list of userProjects with the users information
   */
  async getUsers(projectId) {
    const userProjects = await this.userProjectDao.getUserProjects(projectId);

    logger.info('[User Project Service] :: UsersProjects found:', userProjects);

    if (!userProjects && userProjects == null) {
      logger.info(
        '[User Project Service] :: Users not found for Project ID:',
        projectId
      );
      return { error: 'Users not found', status: 404 };
    }

    logger.info('[User Project Service] :: UsersProject found:', userProjects);

    return userProjects;
  },
  // TODO: delete this method and replace by relateUserWithProject
  async createUserProject(userId, projectId) {
    logger.info(
      `[User Project Service] :: Creating User-Project relation: User ${userId} - Project ${projectId}`
    );
    // check if already exists
    const userProject = await this.userProjectDao.findUserProject({
      userId,
      projectId
    });

    if (userProject) {
      // relation already exists
      logger.info(
        '[User Project Service] :: User-Project relation already exists:',
        userProject
      );
      return userProject;
    }

    const newUserProject = {
      status: 0,
      user: userId,
      project: projectId
    };

    try {
      const savedUserProject = await this.userProjectDao.createUserProject(
        newUserProject
      );

      if (!savedUserProject || savedUserProject == null) {
        logger.error(
          '[User Project Service] :: There was an error creating the User-Project: ',
          newUserProject
        );

        return {
          error: 'There was an error creating the User-Project',
          status: 409
        };
      }

      logger.info(
        '[User Project Service] :: User-Project relation created succesfully: ',
        savedUserProject
      );

      return savedUserProject;
    } catch (error) {
      logger.error(
        '[User Project Service] :: There was an error creating the User-Project: ',
        newUserProject
      );
      throw Error('There was an error creating the User-Project');
    }
  },

  async getProjectsOfUser(userId) {
    try {
      const userProjects = await this.userProjectDao.getProjectsOfUser(userId);
      const projects = userProjects.map(userProject => userProject.project);
      return projects;
    } catch (error) {
      logger.error(
        '[User Project Service] :: Error geting projects of user.',
        error
      );
      return { status: 500, error: 'Error getting projects of user: ', userId };
    }
  },

  async relateUserWithProject({ userId, projectId, roleId, userIdAction }) {
    logger.info(
      `[User Project Service] :: Creating User-Project relation: User ${userId} - Project ${projectId}`
    );

    // check if already exists
    const userProject = await this.userProjectDao.findUserProject({
      user: userId,
      project: projectId,
      role: roleId
    });

    if (userProject) {
      // relation already exists
      logger.info(
        '[User Project Service] :: User-Project relation already exists:',
        userProject
      );
      return userProject;
    }

    const user = await checkExistence(this.userDao, userId, 'user');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    const role = await checkExistence(
      this.roleDao,
      roleId,
      'role',
      this.roleDao.getRoleById(roleId)
    );

    const newUserProject = {
      user: userId,
      project: projectId,
      role: roleId
    };

    try {
      const savedUserProject = await this.userProjectDao.createUserProject(
        newUserProject
      );
      if (
        !savedUserProject ||
        savedUserProject == null ||
        Object.keys(savedUserProject).length === 0
      ) {
        logger.error(
          '[User Project Service] :: There was an error creating the User-Project: ',
          newUserProject
        );
        throw new COAError(errors.common.ErrorCreating('user project'));
      }

      logger.info(
        '[User Project Service] :: User-Project relation created succesfully: ',
        savedUserProject
      );

      logger.info(
        '[User Project Service] :: About to add User-Project changelog'
      );
      await this.changelogService.createChangelog({
        project: project.parent ? project.parent : projectId,
        revision: project.revision,
        user: userIdAction,
        action: ACTION_TYPE.ADD_USER_PROJECT,
        extraData: { user, project, role }
      });

      return savedUserProject;
    } catch (error) {
      logger.error(
        '[User Project Service] :: There was an error creating the User-Project: ',
        newUserProject
      );
      throw new COAError(errors.common.ErrorCreating('user project'));
    }
  },
  async getUserProjectFromRoleDescription({
    userId,
    projectId,
    roleDescriptions
  }) {
    const roles = (await Promise.all(
      roleDescriptions.map(description =>
        this.roleDao.getRoleByDescription(description)
      )
    )).filter(role => !!role);

    if (roles.length === 0) {
      logger.error(
        '[User Project Service] :: There was an error getting roles'
      );
      throw new COAError(errors.common.ErrorGetting('role'));
    }
    const rolesIds = roles.map(role => role.id);
    const userProjects = await this.userProjectDao.getRolesOfUser({
      user: userId,
      project: projectId
    });
    const userProject = userProjects.find(up => rolesIds.includes(up.role.id));
    if (!userProject) {
      logger.error(
        '[UserProjectService] :: User with the given role was not found in the project with id ',
        projectId
      );
      throw new COAError(errors.user.UserNotRelatedToTheProjectAndRole);
    }
    return userProject;
  },

  async removeUserProject({ adminUserId, userId, projectId, roleId }) {
    logger.info(
      `[User Project Service] :: Deleting User-Project relation: User ${userId} with role id ${roleId}- Project ${projectId}`
    );

    const userProject = await this.userProjectDao.findUserProject({
      user: userId,
      project: projectId,
      role: roleId
    });

    if (!userProject) {
      logger.error('[User Project Service] :: User-Project does not exist');
      throw new COAError(
        errors.common.CantFindModelWithId(
          'user project',
          JSON.stringify({
            userId,
            roleId,
            projectId
          })
        )
      );
    }

    const [deletedUserProject] = await this.userProjectDao.removeUserProject(
      userProject.id
    );
    if (!deletedUserProject) {
      logger.error(
        '[User Project Service] :: There was an error deleting the User-Project: ',
        userProject
      );
      throw new COAError(errors.common.ErrorDeleting('user project'));
    }

    logger.info(
      '[User Project Service] :: User-Project relation deleted succesfully: ',
      deletedUserProject
    );

    logger.info('[User Project Service] :: Getting role with id ', roleId);
    const role = await checkExistence(
      this.roleDao,
      roleId,
      'role',
      this.roleDao.getRoleById(roleId)
    );
    logger.info('[User Project Service] :: Getting user with id ', userId);
    const user = await checkExistence(this.userDao, userId, 'user');

    logger.info(
      '[User Project Service] :: Getting project with id ',
      projectId
    );
    const project = await checkExistence(this.projectDao, projectId, 'project');

    logger.info('[User Project Service] :: About to insert changelog');
    const extraData = {
      roleId,
      roleDescription: role.description,
      userEmail: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName
    };
    await this.changelogService.createChangelog({
      project: project.parent ? project.parent : project.id,
      user: adminUserId,
      revision: project.revision,
      action: ACTION_TYPE.REMOVE_USER_PROJECT,
      extraData
    });
    return deletedUserProject;
  },

  async getBeneficiaryByProjectId({ projectId, role }) {
    let beneficiary;

    const beneficiaryRole =
      role ||
      (await this.roleService.getRoleByDescription(rolesTypes.BENEFICIARY));

    const beneficiaryUserProject = await this.userProjectDao.findUserProjectWithUser(
      {
        project: projectId,
        role: beneficiaryRole.id
      }
    );

    if (beneficiaryUserProject) {
      beneficiary = {
        id: beneficiaryUserProject.user.id,
        lastName: beneficiaryUserProject.user.lastName,
        firstName: beneficiaryUserProject.user.firstName
      };
    }

    return beneficiary;
  },

  async getRolesOfUser({ project, user }) {
    try {
      const userProjects = await this.userProjectDao.getRolesOfUser({
        project,
        user
      });
      return userProjects.map(userProject => userProject.role);
    } catch (error) {
      logger.error(
        '[User Project Service] :: Error geting roles of user.',
        error
      );
      throw new COAError(errors.userProject.RolesUserError(user));
    }
  }
};
