/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const config = require('config');
const apiHelper = require('../../services/helper');

const userService = require('../../services/userService');
const passRecoveryService = require('../../services/passRecoveryService');
const { userRoles } = require('../../util/constants');

module.exports = {
  getUser: fastify => async (request, reply) => {
    fastify.log.info('[User Routes] :: Getting user info');
    const { id, role } = request.user;
    if (request.params.userId !== id && role !== userRoles.COA_ADMIN) {
      reply.status(403).send({
        error: `Access denied to get user id: ${request.params.userId}`
      });
    }
    const user = await userService.getUserById(request.params.userId);
    if (!user)
      reply.status(404).send({
        error: `Cannot find user with id: ${request.params.userId}`
      });

    reply.send(user);
  },

  getUsers: () => async (request, reply) => {
    const users = await userService.getUsers();
    reply.status(200).send({ users });
  },

  loginUser: fastify => async (request, reply) => {
    const { email, pwd } = request.body;
    const user = await userService.login(email, pwd);

    const token = fastify.jwt.sign(user);
    const expirationDate = new Date();
    expirationDate.setMonth(
      expirationDate.getMonth() + config.jwt.expirationTime
    );

    reply
      .status(200)
      .setCookie('userAuth', token, {
        domain: config.server.domain,
        path: '/',
        httpOnly: false,
        expires: expirationDate,
        secure: config.server.isHttps
      })
      .send(user);
  },

  signupUser: () => async (request, reply) => {
    const user = await userService.createUser(request.body, request.user);
    reply.status(200).send({ userId: user.id });
  },

  recoverPassword: () => async (request, reply) => {
    const { email } = request.body || {};
    const response = await passRecoveryService.startPassRecoveryProcess(email);
    reply.status(200).send(response);
  },

  changePassword: () => async (request, reply) => {
    const { id } = request.user;
    const { currentPassword, newPassword, encryptedWallet, address, mnemonic } =
      request.body || {};
    await userService.updatePassword(
      id,
      currentPassword,
      newPassword,
      encryptedWallet,
      address,
      mnemonic
    );
    reply.status(200).send({ success: 'Password updated successfully' });
  },

  changeRecoverPassword: () => async (request, reply) => {
    const { address, token, password, encryptedWallet, mnemonic } =
      request.body || {};
    await passRecoveryService.updatePassword(
      address,
      token,
      password,
      encryptedWallet,
      mnemonic
    );
    reply.status(200).send({ success: 'Password updated successfully' });
  },

  getWallet: () => async (request, reply) => {
    const { id, wallet } = request.user;
    const { mnemonic } = await userService.getUserById(id);
    if (!mnemonic) {
      reply.status(404).send({
        error: `Cannot find mnemonic for user id: ${id}`
      });
    } else {
      const { encryptedWallet } = wallet;
      reply.status(200).send(encryptedWallet);
    }
  },

  getMnemonicFromToken: () => async (request, reply) => {
    const { token } = request.params;
    const mnemonic = await passRecoveryService.getMnemonicFromToken(token);
    reply.status(200).send(mnemonic);
  },

  getMyProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getProjectsOfUser(userId);
    reply.status(200).send(projects);
  },

  getFollowedProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getFollowedProjects({ userId });
    reply.status(200).send(projects);
  },

  getAppliedProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getAppliedProjects({ userId });
    reply.status(200).send(projects);
  },

  confirmEmail: () => async (request, reply) => {
    const { id } = request.params;
    const user = await userService.validateUserEmail(id);
    reply.status(200).send(user);
  }
};
