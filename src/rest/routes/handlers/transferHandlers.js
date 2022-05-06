/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const transferService = require('../../services/transferService');

module.exports = {
  createTransfer: () => async (request, reply) => {
    const { projectId } = request.params;
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { transferId, destinationAccount, amount, currency } = body;
    const { receiptPath } = files;
    const senderId = request.user.id;

    const response = await transferService.createTransfer({
      transferId,
      destinationAccount,
      amount,
      currency,
      projectId,
      senderId,
      receiptFile: receiptPath
    });
    reply.status(200).send(response);
  },

  updateTransfer: () => async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    const response = await transferService.updateTransfer(id, { status });
    reply.status(200).send(response);
  },

  getTransfers: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await transferService.getAllTransfersByProject(projectId);
    reply.status(200).send(response);
  },

  getFundedAmount: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await transferService.getFundedAmount({ projectId });
    reply.status(200).send(response);
  },

  getState: () => async (request, reply) => {
    const status = await transferService.getTransferStatusByUserAndProject({
      senderId: request.params.userId,
      projectId: request.params.projectId
    });

    if (status) {
      reply.send({
        state: status
      });
    } else {
      reply.code(400).send({ error: 'No transfer receipt found' });
    }
  },

  sendApprovedTransferClaim: () => async (request, reply) => {
    const { transferId } = request.params;
    const { wallet, id: userId } = request.user;
    const { signedTransaction } = request.body;

    const response = await transferService.sendAddTransferClaimTransaction({
      transferId,
      userId,
      approved: true,
      signedTransaction,
      userAddress: wallet.address
    });

    reply.status(200).send(response);
  },

  sendDisapprovedTransferClaim: () => async (request, reply) => {
    const { transferId } = request.params;
    const { wallet, id: userId } = request.user;
    const { rejectionReason, signedTransaction } = request.body;

    const response = await transferService.sendAddTransferClaimTransaction({
      transferId,
      userId,
      approved: false,
      rejectionReason,
      signedTransaction,
      userAddress: wallet.address
    });

    reply.status(200).send(response);
  },

  getAddTransferClaimTransaction: approved => async (request, reply) => {
    const { transferId } = request.params;
    const { wallet: userWallet, id: userId } = request.user;
    const response = await transferService.getAddTransferClaimTransaction({
      transferId,
      userId,
      approved,
      userWallet
    });
    reply.status(200).send(response);
  },

  getBlockchainData: () => async (request, reply) => {
    const { transferId } = request.params;
    const response = await transferService.getBlockchainData(transferId);
    reply.status(200).send(response);
  }
};
