const { ethers, upgrades } = require('@nomiclabs/buidler');

/**
 * This function is no longer used, but is kept just in case, until the upgrade from buidler to hardhat is performed.
 * An example call is:
 *   claimsRegistryV2 = await upgradeContract(
 *     claimsRegistryContract.address,
 *     'ClaimsRegistryV2',
 *     {
 *       unsafeAllowCustomTypes: true,
 *       upgradeContractFunction: 'claimUpgradeToV1',
 *       upgradeContractFunctionParams: [
 *         creator,
 *         initialVariable
 *       ]
 *     }
 *   );
 * 
 * @param {Address of the previous version contract} contractAddress 
 * @param {Name of the new version of the contract} newImplementationName 
 * @param {Of the upgrade deployment} options 
 * @param {Called for performing the upgrade} upgradeFunction 
 * @returns 
 */
const upgradeContract = async (
  contractAddress,
  newImplementationName,
  options,
  upgradeFunction = upgrades.upgradeProxy
) => {
  // Deploy the upgraded version of the contract
  const newImplementationFactory = await ethers.getContractFactory(newImplementationName);
  options.contractName = newImplementationName;
  const upgradedContract = await upgradeFunction(contractAddress, newImplementationFactory, options);

  // Call the -UpgradeToV1 function from the contract's new version if necessary
  if (!!options.upgradeContractFunction) {
    await upgradedContract[options.upgradeContractFunction](...options.upgradeContractFunctionParams);
  }

  return upgradedContract;
}

module.exports = {
  upgradeContract
}
