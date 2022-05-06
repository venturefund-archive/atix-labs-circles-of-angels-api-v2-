const { utils } = require('ethers');

module.exports = {
  // TODO: is this the right thing to do?
  sha3: (...args) => {
    const stringToHash = args.reduce(
      (concatenated, arg) => concatenated.concat(arg),
      ''
    );
    return utils.id(stringToHash);
  }
};
