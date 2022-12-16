/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const userProjectService = require('../../services/userProjectService');

module.exports = {
  signAgreement: fastify => async (request, reply) => {
    fastify.log.info('[User Project Routes] :: Signing Agreement');
    const newUserProject = await userProjectService.signAgreement({
      userProjectId: request.params.userProjectId,
      status: request.body.status
    });

    if (newUserProject.error) {
      reply.status(newUserProject.status).send({ error: newUserProject.error });
    } else {
      reply.send(newUserProject);
    }
  },

  getUsers: fastify => async (request, reply) => {
    const { projectId } = request.params;

    fastify.log.info(
      '[User Project Routes] :: Getting User associated to Project ID:',
      projectId
    );
    const userProjects = await userProjectService.getUsers(projectId);

    if (userProjects.error) {
      reply.status(userProjects.status).send(userProjects.error);
    } else {
      reply.send(userProjects);
    }
  },

  createUserProject: fastify => async (request, reply) => {
    const { userId, projectId } = request.body;

    fastify.log.info(
      `[User Project Routes] :: Associating User ID ${userId} to Project ID 
      ${projectId}`
    );

    try {
      const userProject = await userProjectService.createUserProject(
        userId,
        projectId
      );

      if (userProject.error) {
        fastify.log.error(
          '[User Project Routes] :: Error creating user-project relation: ',
          userProject.error
        );
        reply.status(userProject.status).send(userProject.error);
      } else {
        fastify.log.info(
          '[User Routes Service] :: User-Project relation created succesfully: ',
          userProject
        );
        reply
          .status(200)
          .send({ success: 'User-project relation created successfully!' });
      }
    } catch (error) {
      fastify.log.error(
        '[User Project Routes] :: Error creating user-project relation: ',
        error
      );
      reply.status(500).send({ error: 'Error creating user-project relation' });
    }
  },

  relateUserWithProject: fastify => async (request, reply) => {
    const { userId, projectId, roleId } = request.body;

    fastify.log.info(
      `[User Project Routes] :: Associating User ID ${userId} to Project ID 
      ${projectId} with role with id ${roleId}`
    );
    const userProject = await userProjectService.relateUserWithProject({
      userId,
      projectId,
      roleId
    });

    fastify.log.info(
      '[User Routes Service] :: User-Project relation created succesfully: ',
      userProject
    );
    reply.status(200).send(userProject);
  },

  removeUserProject: fastify => async (request, reply) => {
    const { userId, projectId, roleId } = request.body;
    const adminUserId = request.user.id;

    fastify.log.info(
      `[User Project Routes] :: Deleting User ID ${userId} to Project ID 
      ${projectId} with role with id ${roleId}`
    );
    const userProject = await userProjectService.removeUserProject({
      adminUserId,
      userId,
      projectId,
      roleId
    });

    fastify.log.info(
      '[User Routes Service] :: User-Project relation created succesfully: ',
      userProject
    );
    reply.status(200).send(userProject);
  }
};
