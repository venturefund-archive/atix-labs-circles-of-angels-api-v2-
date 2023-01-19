const { generateAPIKeyAndSecret } = require('../../rest/util/apiKeys');
const { validate } = require('uuid');
const { encryption } = require('../../rest/util/constants');

describe('Testing apiKey util', () => {
  describe('Testing generateAPIKeyAndSecret', () => {
    it('apiKey should be an uuid', () => {
      const response = generateAPIKeyAndSecret();
      expect(validate(response.apiKey)).toBe(true);
    });

    it('apiKey should be an uuid', () => {
      const response = generateAPIKeyAndSecret();
      expect(Buffer.from(response.apiSecret).byteLength).toBe(
        encryption.apiSecretSize
      );
    });
  });
});
