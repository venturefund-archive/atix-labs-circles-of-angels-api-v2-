const logger = require('../logger');

module.exports = {
  async saveEvidenceFile(evidenceFile) {
    logger.info('[EvidenceFileDao] :: Entering saveEvidenceFile method');
    return this.model.create(evidenceFile);
  },
  async getEvidenceFilesByEvidenceId(evidenceId) {
    return this.model.find({ evidence: evidenceId }) || [];
  }
};
