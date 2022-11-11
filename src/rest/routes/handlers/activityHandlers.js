/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const activityService = require('../../services/activityService');

module.exports = {
  createActivity: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const {
      title,
      description,
      acceptanceCriteria,
      budget,
      auditor
    } = request.body;
    const response = await activityService.createActivity({
      milestoneId,
      title,
      description,
      acceptanceCriteria,
      budget,
      auditor
    });
    reply.status(200).send(response);
  },

  updateActivity: () => async (req, reply) => {
    const response = await activityService.updateActivity({
      activityId: req.params.activityId,
      title: req.body.title,
      description: req.body.description,
      acceptanceCriteria: req.body.acceptanceCriteria,
      budget: req.body.budget,
      auditor: req.body.auditor
    });
    reply.status(200).send(response);
  },

  deleteTask: () => async (request, reply) => {
    const { taskId } = request.params;
    const response = await activityService.deleteTask(taskId);
    reply.status(200).send(response);
  },

  assignOracle: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    const { oracleId } = request.body || {};
    const response = await activityService.assignOracle(
      taskId,
      oracleId,
      userId
    );
    reply.status(200).send(response);
  },

  getApprovedClaimTransaction: () => async (request, reply) => {
    const { taskId } = request.params;
    const { id: userId, wallet: userWallet } = request.user;
    const { proof } = request.raw.files || {};
    const { description } = request.raw.body || {};

    const response = await activityService.getAddClaimTransaction({
      taskId,
      userId,
      file: proof,
      description,
      approved: true,
      userWallet
    });

    reply.status(200).send(response);
  },

  getDisapprovedClaimTransaction: () => async (request, reply) => {
    const { taskId } = request.params;
    const { wallet: userWallet } = request.user;
    const { proof } = request.raw.files || {};

    const response = await activityService.getAddClaimTransaction({
      taskId,
      file: proof,
      approved: false,
      userWallet
    });

    reply.status(200).send(response);
  },

  sendClaimTransaction: approved => async (request, reply) => {
    const { taskId } = request.params;
    const { id: userId, wallet } = request.user;
    const { proof } = request.raw.files || {};
    const { description, signedTransaction } = request.raw.body || {};

    const response = await activityService.sendAddClaimTransaction({
      taskId,
      userId,
      file: proof,
      description,
      approved,
      signedTransaction,
      userAddress: wallet.address
    });
    reply.status(200).send(response);
  },

  getTasksEvidences: () => async (request, reply) => {
    const { taskId } = request.params;
    const response = await activityService.getTaskEvidences({
      taskId
    });
    reply.status(200).send(response);
  },

  getEvidenceBlockchainData: () => async (request, reply) => {
    const { evidenceId } = request.params;
    const response = await activityService.getEvidenceBlockchainData(
      evidenceId
    );
    reply.status(200).send(response);
  }
};
