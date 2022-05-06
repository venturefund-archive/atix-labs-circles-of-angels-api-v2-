/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const fileService = require('../../services/fileService');

module.exports = {
  deleteFile: fastify => async (request, reply) => {
    const { fileId } = request.params;
    fastify.log.info(`[File Routes] :: Deleting file ID ${fileId}`);

    try {
      const res = await fileService.deleteFile(fileId);

      if (res && res.error) {
        fastify.log.error(
          `[File Routes] :: Error deleting file ID ${fileId}:`,
          res.error
        );
        reply.status(res.status).send(res.error);
      } else {
        fastify.log.info('[File Routes] :: deleting file ID', fileId);

        reply.send(res);
      }
    } catch (error) {
      fastify.log.error(
        `[File Routes] :: Error deleting file ID ${fileId}:`,
        error
      );
      reply.status(500).send({ error: 'Error deleting file' });
    }
  },

  getMilestonesTemplateFile: () => async (_request, reply) => {
    const response = await fileService.getMilestonesTemplateFile();

    reply.header('file', response.filename);
    reply.header('Access-Control-Expose-Headers', 'file');
    reply.status(200).send(response.filestream);
  }
};
