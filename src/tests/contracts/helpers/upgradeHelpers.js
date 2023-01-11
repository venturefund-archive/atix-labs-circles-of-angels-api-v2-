const { ethers, upgrades } = require('@nomiclabs/buidler');

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
