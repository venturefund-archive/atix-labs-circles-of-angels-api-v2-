const IPFSStorage = require('../util/storage');

const storageType = {
  IPFS: 'IPFS'
};

const getSaveInStorage = {
  [storageType.IPFS]: IPFSStorage.generateStorageHash
};

module.exports = {
  async saveStorageData({ data, storage = storageType.IPFS }) {
    const save = getSaveInStorage[storage];
    return save(data);
  }
};
