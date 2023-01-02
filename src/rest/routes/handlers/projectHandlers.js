/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const httpStatus = require('http-status');
const projectService = require('../../services/projectService');
const projectServiceExperience = require('../../services/projectExperienceService');

const { supporterRoles } = require('../../util/constants');
const userService = require('../../services/userService');
const COAError = require('../../errors/COAError');
const errors = require('../../errors/exporter/ErrorExporter');

module.exports = {
  createProject: () => async (request, reply) => {
    const ownerId = request.user.id;
    const response = await projectService.createProject({ ownerId });
    reply.status(200).send(response);
  },
  cloneProject: () => async (request, reply) => {
    const userId = request.user.id;
    const { projectId } = request.params;
    const response = await projectService.cloneProject({ projectId, userId });
    reply.status(200).send(response);
  },
  updateBasicProjectInformation: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { user } = request;
    const { projectId } = request.params;
    const { projectName, location, timeframe, timeframeUnit } = body;
    const { thumbnailPhoto } = files;
    const response = await projectService.updateBasicProjectInformation({
      projectId,
      projectName,
      location,
      timeframe,
      timeframeUnit,
      file: thumbnailPhoto,
      user
    });
    reply.status(200).send(response);
  },
  updateProjectDetails: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const {
      mission,
      problemAddressed,
      currencyType,
      currency,
      additionalCurrencyInformation
    } = body;
    const { legalAgreementFile, projectProposalFile } = files;
    const response = await projectService.updateProjectDetails({
      projectId,
      mission,
      problemAddressed,
      currencyType,
      currency,
      additionalCurrencyInformation,
      legalAgreementFile,
      projectProposalFile,
      user: request.user
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

  sendProjectToReview: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.sendProjectToReview({
      user,
      projectId
    });
    reply.status(httpStatus.OK).send(response);
  },

  deleteProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.deleteProject(projectId);
    reply.send(response);
  },

  publishProject: () => async (request, reply) => {
    const userId = request.user.id;
    const response = await projectService.publishProject({
      projectId: request.params.projectId,
      userId
    });
    reply.send(response);
  },

  // TODO: separate this into different handlers per status
  //       or make it receive the status from the route.
  //       either way, I don't think the status should come in the body
  updateProjectStatus: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const { status, rejectionReason } = request.body;

    const response = await projectService.updateProjectStatusOld(
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
    const token = request.headers.authorization;
    let existentUser;
    if (token) {
      if (!token.startsWith('Bearer ')) throw new Error('Invalid token format');
      const [_, bearerToken] = token.split(' ');
      const user = await fastify.jwt.verify(bearerToken);
      existentUser = await userService.getUserById(user.id);
      if (!existentUser || existentUser.blocked) {
        fastify.log.error(
          '[Project Handler] :: Unathorized access for user:',
          user
        );
        throw new COAError(errors.server.UnauthorizedUser);
      }
    }
    const response = await projectService.getProject(projectId, existentUser);
    reply.status(200).send(response);
  },

  getProjectFull: () => async (request, reply) => {
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
  },

  getProjectTransactions: () => async (request, reply) => {
    const { projectId } = request.params;
    const { type } = request.query;
    const response = await projectService.getProjectTransactions({
      projectId,
      type
    });
    reply.status(httpStatus.OK).send(response);
  },

  getProjectChangelog: () => async (request, reply) => {
    const { projectId } = request.params;
    const {
      activityId,
      milestoneId,
      revisionId,
      evidenceId,
      userId
    } = request.query;
    const response = await projectService.getProjectChangelog({
      project: projectId,
      activity: activityId,
      milestone: milestoneId,
      revision: revisionId,
      user: userId,
      evidence: evidenceId
    });
    reply.status(httpStatus.OK).send(response);
  },

  cancelProjectReview: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.cancelProjectReview({
      user,
      projectId
    });
    reply.status(httpStatus.OK).send(response);
  },

  updateProjectReview: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const { approved, reason } = request.body;
    const response = await projectService.updateProjectReview({
      projectId,
      approved,
      userId: user.id,
      reason
    });
    reply.status(httpStatus.OK).send(response);
  }
};
