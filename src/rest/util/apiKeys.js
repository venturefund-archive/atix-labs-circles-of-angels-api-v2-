const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { encryption } = require('./constants');

module.exports = {
  generateAPIKeyAndSecret() {
    return {
      apiKey: uuidv4(),
      apiSecret: crypto
        .randomBytes(encryption.apiSecretSize)
        .toString('base64'),
    };
  },
};
