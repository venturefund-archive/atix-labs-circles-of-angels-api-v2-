/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectService = require('../../services/projectService');
const projectServiceExperience = require('../../services/projectExperienceService');

const { projectStatuses, supporterRoles } = require('../../util/constants');

module.exports = {
  createProject: () => async (request, reply) => {
    const ownerId = request.user.id;
    const response = await projectService.createProject({ ownerId });
    reply.status(200).send(response);
  },
  updateBasicProjectInformation: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const { projectName, location, timeframe, timeframeUnit } = body;
    const { thumbnailPhoto } = files;
    const response = await projectService.updateBasicProjectInformation({
      projectId,
      projectName,
      location,
      timeframe,
      timeframeUnit,
      file: thumbnailPhoto
    });
    reply.status(200).send(response);
  },
  createProjectThumbnail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectName, location, timeframe } = body;
    const ownerId = request.user.id;
    const { cardPhotoPath } = files;
    const response = await projectService.createProjectThumbnail({
      projectName,
      location,
      timeframe,
      file: cardPhotoPath,
      ownerId
    });
    reply.status(200).send(response);
  },

  updateProjectThumbnail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const { projectName, location, timeframe } = body;
    const ownerId = request.user.id;
    const { cardPhotoPath } = files;
    const response = await projectService.updateProjectThumbnail(projectId, {
      projectName,
      location,
      timeframe,
      file: cardPhotoPath,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectThumbnail: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectThumbnail(projectId);
    reply.status(200).send(response);
  },

  createProjectDetail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { mission, problemAddressed } = body;
    const { coverPhotoPath, agreementFile, proposalFile } = files;
    const response = await projectService.createProjectDetail(projectId, {
      mission,
      problemAddressed,
      coverPhoto: coverPhotoPath,
      agreementFile,
      proposalFile,
      ownerId
    });
    reply.status(200).send(response);
  },

  updateProjectDetail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { mission, problemAddressed } = body;
    const { coverPhotoPath, agreementFile, proposalFile } = files;
    const response = await projectService.updateProjectDetail(projectId, {
      mission,
      problemAddressed,
      coverPhoto: coverPhotoPath,
      agreementFile,
      proposalFile,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectDetail: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectDetail(projectId);
    reply.status(200).send(response);
  },

  updateProjectProposal: () => async (request, reply) => {
    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { proposal } = request.body;
    const response = await projectService.updateProjectProposal(projectId, {
      proposal,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectProposal: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectProposal(projectId);
    reply.status(200).send(response);
  },

  getMilestonesFile: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectMilestonesPath(projectId);

    reply.header('file', response.filename);
    reply.header('Access-Control-Expose-Headers', 'file');
    reply.status(200).sendFile(response.filepath);
  },

  getTemplateOfProjectMilestone: fastify => async (request, reply) => {
    // TODO
    reply.send(
      'Inside getTemplateOfProjectMilestone, this should return a stream to template file, but not today :)'
    );
  },

  processMilestonesFile: () => async (request, reply) => {
    const files = request.raw.files || {};
    const { projectId } = request.params;
    const { milestoneFile } = files;
    const ownerId = request.user.id;
    const response = await projectService.processMilestoneFile(projectId, {
      file: milestoneFile,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectMilestones: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectMilestones(projectId);
    reply.status(200).send(response);
  },

  sendToReview: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      projectStatuses.TO_REVIEW
    );
    reply.send(response);
  },

  deleteProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      projectStatuses.DELETED
    );
    reply.send(response);
  },

  publishProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      // TODO: for now is CONSENSUS, but should be PUBLISHED
      //       once the optional thing is defined/coded
      projectStatuses.CONSENSUS
    );
    reply.send(response);
  },

  // TODO: separate this into different handlers per status
  //       or make it receive the status from the route.
  //       either way, I don't think the status should come in the body
  updateProjectStatus: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const { status, rejectionReason } = request.body;

    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      status,
      rejectionReason
    );

    reply.send(response);
  },

  getProjects: props => async (_, reply) => {
    const projects = await projectService.getProjects(props);
    reply.status(200).send(projects);
  },

  getProjectsWithTransfers: () => async (request, reply) => {
    const projects = await projectService.getProjectsWithTransfers();
    reply.status(200).send(projects);
  },

  getPublicProjects: () => async (request, reply) => {
    const projects = await projectService.getPublicProjects();
    reply.status(200).send(projects);
  },

  getFeaturedProjects: () => async (request, reply) => {
    const projects = await projectService.getFeaturedProjects();
    reply.status(200).send(projects);
  },
  getExperiencesOfProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectServiceExperience.getProjectExperiences({
      projectId
    });
    reply.status(200).send(response);
  },
  addExperienceToProject: () => async (request, reply) => {
    const userId = request.user.id;
    const { comment } = request.raw.body || {};
    const { photos } = request.raw.files || {};
    const { projectId } = request.params;
    const response = await projectServiceExperience.addExperience({
      comment,
      projectId,
      userId,
      photos: photos && !photos.length ? [photos] : photos
    });
    reply.status(200).send(response);
  },

  // FIXME --> thumbnail?
  getProjectsPreview: fastify => async (request, reply) => {},

  getProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProject(projectId);
    reply.status(200).send(response);
  },

  getProjectFull: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const project = await projectService.getProjectFull(projectId);

    reply.status(200).send(project);
  },

  getProjectUsers: () => async (request, reply) => {
    const { projectId } = request.params;
    const users = await projectService.getProjectUsers(projectId);
    reply.status(200).send(users);
  },

  followProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.followProject({ projectId, userId });
    reply.status(200).send(response);
  },

  unfollowProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;

    const response = await projectService.unfollowProject({
      projectId,
      userId
    });

    reply.status(200).send(response);
  },

  isFollower: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.isFollower({ projectId, userId });
    reply.status(200).send(response);
  },

  applyAsOracle: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.applyToProject({
      projectId,
      userId,
      role: supporterRoles.ORACLES
    });

    reply.status(200).send(response);
  },

  applyAsFunder: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.applyToProject({
      projectId,
      userId,
      role: supporterRoles.FUNDERS
    });

    reply.status(200).send(response);
  },

  isCandidate: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.isCandidate({ projectId, userId });
    reply.status(200).send(response);
  },

  setProjectAsExecuting: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.transitionFundingProjects(projectId);
    reply.status(200).send(response);
  },

  setProjectAsFunding: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.transitionConsensusProjects(
      projectId
    );
    reply.status(200).send(response);
  },

  getBlockchainData: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getBlockchainData(projectId);
    reply.status(200).send(response);
  }
};
