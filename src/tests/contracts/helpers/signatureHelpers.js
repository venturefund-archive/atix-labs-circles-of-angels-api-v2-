const { utils } = require('ethers');

const abiCoder = utils.defaultAbiCoder;

const signParameters = async (
  parameterTypes,
  parameterValues,
  signer
) => {
  const encodedParams = abiCoder.encode(
    parameterTypes,
    parameterValues
  )

  // Message hash is converted to bytes so that signMessage doesn't change it's encoding
  const messageHash = utils.arrayify(utils.keccak256(encodedParams));
  const signature = await signer.signMessage(messageHash);

  return signature;
}

module.exports = {
  signParameters
};
