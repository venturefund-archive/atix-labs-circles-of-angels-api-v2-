/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const config = require('config');

const userService = require('../../services/userService');
const passRecoveryService = require('../../services/passRecoveryService');
const { userRoles, encryption } = require('../../util/constants');
const { generateAPIKeyAndSecret } = require('../../util/apiKeys');
const { hash } = require('bcrypt');

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
    const { email, projectId } = request.query;
    let users;
    if (email) {
      const user = await userService.getUserByEmail(email);
      users = user ? [user] : [];
    } else if (projectId) {
      users = await userService.getUsersByProject(projectId);
    } else {
      users = await userService.getUsers();
    }
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
      .header('Authorization', `Bearer ${token}`)
      .send(user);
    /*
      .setCookie('userAuth', token, {
        domain: config.server.domain,
        path: '/',
        httpOnly: false,
        expires: expirationDate,
        secure: config.server.isHttps
      })
      */
  },

  loginUserAPI: fastify => async (request, reply) => {
    const { apiKey, apiSecret } = request.body;
    const user = await userService.loginAPI(apiKey, apiSecret);

    const token = fastify.jwt.sign(user);
    const expirationDate = new Date();
    expirationDate.setMonth(
      expirationDate.getMonth() + config.jwt.expirationTime
    );

    reply
      .status(200)
      .header('Authorization', `Bearer ${token}`)
      .header('Access-Control-Allow-Origin', '*')
      .send(user);
    /*
      .setCookie('userAuth', token, {
        domain: config.server.domain,
        path: '/',
        httpOnly: false,
        expires: expirationDate,
        secure: config.server.isHttps
      })
      */
  },

  generateAPIKeyAndSecret: fastify => async (request, reply) => {
    const { id } = request.user;
    const { apiKey, apiSecret } = generateAPIKeyAndSecret();
    const encriptedSecret = await hash(apiSecret, encryption.saltOrRounds);
    await userService.updateApiKeyAndSecret(id, apiKey, encriptedSecret);
    reply.status(201).send({ apiKey, apiSecret });
  },

  signupUser: () => async (request, reply) => {
    const user = await userService.createUser(request.body, request.user);
    reply.status(200).send({ userId: user.id });
  },

  createUser: () => async (request, reply) => {
    const { id } = await userService.newCreateUser(request.body, request.user);
    reply.status(200).send({ id });
  },

  recoverPassword: () => async (request, reply) => {
    const { email, projectId } = request.body || {};
    const response = await passRecoveryService.startPassRecoveryProcess(
      email,
      projectId
    );
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

  changeResetPassword: () => async (request, reply) => {
    const { token, password } = request.body || {};
    const response = await passRecoveryService.updatePassword({
      token,
      password
    });
    reply.status(200).send(response);
  },

  getWallet: () => async (request, reply) => {
    const { id, wallet } = request.user;
    const { mnemonic } = await userService.getUserWallet(id);
    if (!mnemonic) {
      reply.status(404).send({
        error: `Cannot find mnemonic for user id: ${id}`
      });
    } else {
      const { encryptedWallet } = wallet;
      reply.status(200).send({ wallet: encryptedWallet });
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
  },

  sendWelcomeEmail: () => async (request, reply) => {
    const { userId, projectId } = request.body;
    const success = await userService.sendWelcomeEmail(userId, projectId);
    reply.status(200).send(success);
  },

  setPin: () => async (request, reply) => {
    const { id } = request.user;
    const success = await userService.setPin(id);
    reply.status(200).send(success);
  },

  createWallet: () => async (request, reply) => {
    const { id } = request.user;
    const { wallet, address, mnemonic, iv } = request.body;
    const success = await userService.createWallet(id, {
      wallet,
      address,
      mnemonic,
      iv
    });
    reply.status(200).send(success);
  },

  getTokenStatus: () => async (request, reply) => {
    const { token } = request.params;
    const response = await passRecoveryService.getTokenStatus(token);
    reply.status(200).send(response);
  }
};
