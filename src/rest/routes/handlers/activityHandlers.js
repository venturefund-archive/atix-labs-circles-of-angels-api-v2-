/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const httpStatus = require('http-status');
const activityService = require('../../services/activityService');
const userService = require('../../services/userService');

const COAError = require('../../errors/COAError');
const errors = require('../../errors/exporter/ErrorExporter');
const { ACTIVITY_TYPES } = require('../../util/constants');

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
      auditor,
      user: request.user,
      type: ACTIVITY_TYPES.FUNDING
    });
    reply.status(httpStatus.CREATED).send(response);
  },

  updateActivity: () => async (req, reply) => {
    const response = await activityService.updateActivity({
      activityId: req.params.activityId,
      title: req.body.title,
      description: req.body.description,
      acceptanceCriteria: req.body.acceptanceCriteria,
      budget: req.body.budget,
      auditor: req.body.auditor,
      user: req.user,
      type: req.body.type
    });
    reply.status(httpStatus.OK).send(response);
  },

  updateActivityStatus: () => async (request, reply) => {
    const { status, txId, reason } = request.body;
    const response = await activityService.updateActivityStatus({
      user: request.user,
      activityId: request.params.activityId,
      status,
      txId,
      reason
    });
    reply.status(httpStatus.OK).send(response);
  },

  deleteActivity: () => async (request, reply) => {
    const { taskId } = request.params;
    const response = await activityService.deleteActivity(taskId, request.user);
    reply.status(httpStatus.OK).send(response);
  },

  createActivityFile: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    await activityService.createActivityFile({ taskId, userId });
    reply.status(httpStatus.OK).send({ taskId });
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
  },

  addEvidence: () => async (request, reply) => {
    const response = await activityService.addEvidence({
      activityId: request.params.activityId,
      userId: request.user.id,
      title: request.raw.body.title,
      description: request.raw.body.description,
      type: request.raw.body.type,
      amount: request.raw.body.amount,
      transferTxHash: request.raw.body.transferTxHash,
      files: request.raw.files
    });
    reply.status(httpStatus.OK).send(response);
  },

  updateEvidenceStatus: () => async (request, reply) => {
    const { evidenceId } = request.params;
    const { status, reason } = request.body;
    const response = await activityService.updateEvidenceStatus({
      evidenceId,
      newStatus: status.toLowerCase(),
      userId: request.user.id,
      reason
    });
    reply.status(httpStatus.OK).send(response);
  },

  getActivityEvidences: fastify => async (request, reply) => {
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
    const response = await activityService.getActivityEvidences({
      activityId: request.params.activityId,
      user: existentUser
    });
    reply.status(httpStatus.OK).send(response);
  },

  getEvidence: () => async (request, reply) => {
    const response = await activityService.getEvidence(
      request.params.evidenceId
    );
    reply.status(httpStatus.OK).send(response);
  },

  sendActivityTransaction: () => async (request, reply) => {
    const response = await activityService.sendActivityTransaction({
      user: request.user,
      activityId: request.params.activityId,
      authorizationSignature: request.body.authorizationSignature
    });
    reply.status(httpStatus.OK).send(response);
  }
};
