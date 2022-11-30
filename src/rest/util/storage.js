global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
const RifStorage = require('@rsksmart/rif-storage');
const { Provider } = require('@rsksmart/rif-storage');
const config = require('config');

const { protocol, host, port } = config.rifStorageOptions;
const logger = require('../logger');
const validateMtype = require('../services/helpers/validateMtype');
const validatePhotoSize = require('../services/helpers/validatePhotoSize');

const storageIPFS = RifStorage.default(Provider.IPFS, { host, port, protocol });

module.exports = {
  generateStorageHash(data, type = null) {
    logger.info('[Storage] :: Entering generateStorageHash method');
    let dataToPut = data;
    let options;
    if (type) {
      validateMtype(type, data);
      validatePhotoSize(data);
      options = { fileName: data.name };
      dataToPut = data.data;
    }
    try {
      return storageIPFS.put(Buffer.from(dataToPut), options);
    } catch (error) {
      logger.error('[Storage] :: An error has occurred', error);
      throw error;
    }
  },

  async getStorageData(fileHash) {
    logger.info('[Storage] :: Entering getStorageData method');
    try {
      const retrievedData = await storageIPFS.get(fileHash);
      return retrievedData;
    } catch (error) {
      logger.error('[Storage] :: An error has occurred', error);
      throw error;
    }
  }
};
