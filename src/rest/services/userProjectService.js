/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
  }
};
