const { utils } = require('ethers');

const getSigner = async (env, account) => env.deployments.getSigner(account);

const abiCoder = utils.defaultAbiCoder;

function getMessageHash(parameterTypes, parameterValues) {
  const encodedParams = abiCoder.encode(parameterTypes, parameterValues);
  return utils.keccak256(encodedParams);
}

async function signParameters(parameterTypes, parameterValues, signer) {
  const encodedParams = abiCoder.encode(parameterTypes, parameterValues);

  // Message hash is converted to bytes so that signMessage doesn't change it's encoding
  const messageHash = utils.arrayify(utils.keccak256(encodedParams));
  const signature = await signer.signMessage(messageHash);

  return signature;
}

function convertEmptyToNullableList(list) {
  let convertedList = null;
  if (list.length !== 0) {
    convertedList = list;
  }
  return convertedList;
}

module.exports = {
  signParameters,
  getSigner,
  getMessageHash,
  convertEmptyToNullableList
};
