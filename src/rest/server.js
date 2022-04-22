/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing
 * smart contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { network, run } = require('@nomiclabs/buidler');
const COAError = require('./errors/COAError');
const errors = require('./errors/exporter/ErrorExporter');
const { ethInit } = require('../rest/services/eth/ethInit');
const userService = require('./services/userService');
const cronJobService = require('./services/cronjob/cronjobService');

/**
 * @method start asynchronous start server -> initialice fastify, with database, plugins and routes
 * @param db instance of database creator.
 * @param logger instance of a logger that contains the pino interface
 * @param serverConfigs server configs for the connection. I.e -> {host: 'localhost', port: 3000}
 */

// TODO : this should handle the txs that reverted.
// TODO : move this to another file.
process.on('unhandledRejection', (reason, p) => {
  const { data, message, code } = reason;
  if (message === 'VM Exception while processing transaction: revert') {
    const txs = Object.keys(data).filter(k => !['stack', 'name'].includes(k));
    console.log('failed txs', txs);
  }
});

module.exports.start = async ({ db, logger, configs }) => {
  try {
    const swaggerConfigs = configs.swagger;
    const fastify = require('fastify')({ logger });
    fastify.register(require('fastify-cors'), {
      credentials: true,
      allowedHeaders: ['content-type'],
      origin: true
    });

    fastify.register(require('fastify-cookie'));
    fastify.configs = configs;
    fastify.register(require('fastify-file-upload'));
    initJWT(fastify);
    // Init DB
    try {
      await db.register(fastify); // fastify.models works after run fastify.listen(...,...)
    } catch (e) {
      fastify.log.error('Cant connect to DB');
    }

    // Load Swagger
    fastify.register(require('fastify-swagger'), swaggerConfigs);
    fastify.register(require('fastify-static'), { root: '/' });

    fastify.setErrorHandler((error, request, reply) => {
      if (error instanceof COAError) {
        reply.status(error.statusCode).send(error.message);
      } else {
        reply.status(500).send('Internal Server Error');
      }
    });
    loadRoutes(fastify);

    await fastify.listen(configs.server);
    // start service initialization, load and inject dependencies
    if (network.name === 'buidlerevm') {
      try {
        logger.info('Deploying contracts');
        await run('deploy');
        logger.info('Contracts deployed');
      } catch (error) {
        logger.error('Error deploying contracts', error);
      }
    }
    require('./ioc')(fastify);
    ethInit();
    cronJobService.cronInit();

    // await helperBuilder(fastify);
    // await fastify.eth.initListener();
    // await fastify.eth.listener.startListen();
    module.exports.fastify = fastify;
  } catch (err) {
    logger.error('Error initializing server', err);
    process.exit(1);
  }
};

const loadRoutes = fastify => {
  const fs = require('fs');
  const routesDir = `${__dirname}/routes`;
  const dirents = fs.readdirSync(routesDir, { withFileTypes: true });
  const routeNames = dirents
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name);
  const routes = routeNames.map(route => require(`${routesDir}/${route}`));

  routes.forEach(route =>
    Object.values(route).forEach(async ({ method, path, options, handler }) => {
      fastify.register(async () => {
        const routeOptions = { ...options };
        if (options.beforeHandler) {
          const decorators = options.beforeHandler.map(
            decorator => fastify[decorator]
          );
          routeOptions.beforeHandler = decorators;
        }

        fastify.route({
          method: method.toUpperCase(),
          url: path,
          ...routeOptions,
          handler: handler(fastify)
        });
      });
    })
  );
};

const initJWT = fastify => {
  const fp = require('fastify-plugin');
  const { userRoles } = require('./util/constants');
  const jwtPlugin = fp(async () => {
    fastify.register(require('fastify-jwt'), {
      secret: fastify.configs.jwt.secret
    });

    const getToken = request => {
      const token = request.cookies.userAuth;
      if (!token) {
        fastify.log.error('[Server] :: No token received for authentication');
        throw new COAError(errors.server.NotRegisteredUser);
      }
      return token;
    };

    // TODO : this should be somewhere else.
    const validateUser = async (token, reply, roleId) => {
      const user = await fastify.jwt.verify(token);
      const validUser = await userService.validUser(user, roleId);
      if (!validUser) {
        fastify.log.error('[Server] :: Unathorized access for user:', user);
        throw new COAError(errors.server.UnauthorizedUser);
      }
    };

    const getUserWallet = async userId => {
      const wallet = await userService.getUserWallet(userId);
      return wallet;
    };

    fastify.decorate('generalAuth', async (request, reply) => {
      try {
        const token = getToken(request, reply);
        fastify.log.info('[Server] :: General JWT Authentication');
        if (token) await validateUser(token, reply);
      } catch (err) {
        fastify.log.error('[Server] :: There was an error authenticating', err);
        throw new COAError(errors.server.AuthenticationFailed);
      }
    });
    fastify.decorate('adminAuth', async (request, reply) => {
      try {
        const token = getToken(request, reply);
        fastify.log.info('[Server] :: Admin JWT Authentication');
        if (token) await validateUser(token, reply, userRoles.COA_ADMIN);
      } catch (error) {
        fastify.log.error(
          '[Server] :: There was an error authenticating',
          error
        );
        throw new COAError(errors.server.AuthenticationFailed);
      }
    });
    fastify.decorate('withUser', async request => {
      try {
        const token = getToken(request);
        if (token) request.user = await fastify.jwt.verify(token);
        request.user.wallet = await getUserWallet(request.user.id);
      } catch (error) {
        fastify.log.error(
          '[Server] :: There was an error authenticating',
          error
        );
        throw new COAError(errors.server.AuthenticationFailed);
      }
    });
  });
  fastify.register(jwtPlugin);
};
