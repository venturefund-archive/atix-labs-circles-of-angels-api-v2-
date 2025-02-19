/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const httpStatus = require('http-status');
const milestoneService = require('../../services/milestoneService');

module.exports = {
  getMilestones: () => async (request, reply) => {
    const filters = request.query;
    const milestones = await milestoneService.getMilestones(filters);
    reply.status(200).send(milestones);
  },

  createMilestone: () => async (request, reply) => {
    const { projectId } = request.params;
    const { title, description } = request.body;
    const response = await milestoneService.createMilestone({
      projectId,
      title,
      description,
      user: request.user
    });
    reply.status(httpStatus.CREATED).send(response);
  },

  updateMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const { title, description } = request.body;
    const { user } = request;
    const response = await milestoneService.updateMilestone({
      milestoneId,
      title,
      description,
      user
    });
    reply.status(httpStatus.OK).send(response);
  },

  deleteMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const userId = request.user.id;
    const response = await milestoneService.deleteMilestone(
      milestoneId,
      userId
    );
    reply.status(httpStatus.OK).send(response);
  },

  claimMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const userId = request.user.id;

    const response = await milestoneService.claimMilestone({
      milestoneId,
      userId
    });

    reply.status(200).send(response);
  },

  transferredMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const { claimReceiptFile } = request.raw.files || {};
    const userId = request.user.id;

    const response = await milestoneService.transferredMilestone({
      milestoneId,
      userId,
      claimReceiptFile
    });

    reply.status(200).send(response);
  }
};
