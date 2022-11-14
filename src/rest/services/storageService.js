const IPFSStorage = require('../util/storage');

const storageType = {
  IPFS: 'IPFS'
};

const getStorage = {
  [storageType.IPFS]: IPFSStorage.generateStorageHash
};

module.exports = {
  async saveStorageData({ data, storage = storageType.IPFS }) {
    const save = getStorage[storage];
    return save(data);
  }
};
