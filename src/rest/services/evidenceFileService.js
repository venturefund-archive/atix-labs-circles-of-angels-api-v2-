const logger = require('../logger');

module.exports = {
  async saveEvidenceFile(evidenceFile) {
    logger.info('[EvidenceFileService] :: Entering saveEvidenceFile method');
    return this.evidenceFileDao.saveEvidenceFile(evidenceFile);
  }
};
