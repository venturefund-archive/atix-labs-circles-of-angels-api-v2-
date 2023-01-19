/* eslint-disable */
const { ContractFactory } = require('ethers');
const { GSNProvider } = require('@openzeppelin/gsn-provider');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');
const {
  getAdminAddress,
  getStorageLayout,
  getUnlinkedBytecode,
  getVersion
} = require('@openzeppelin/upgrades-core');
const { fetchOrDeploy, readValidations } = require('./helpers/ozHelper')
const AdminUpgradeabilityProxy = require('@openzeppelin/upgrades-core/artifacts/AdminUpgradeabilityProxy.json');
const ProxyAdmin = require('@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json');
const {
  artifacts,
  network,
  config,
  ethers,
  upgrades,
  web3
} = require('hardhat');
const {
  ensureFileSync,
  existsSync,
  readJsonSync,
  writeJSONSync
} = require('fs-extra');
const { contractAddresses, gsnConfig, server } = require('config');
const logger = require('../rest/logger')

// TODO : this can be placed into the hardhat's config.
const stateFilename = 'state.json';

// HIDE_LOGS in env file, to hide or not the logger printing in this file
const HIDE_LOGS = server.hideLogs;

const readState = () => readJsonSync(stateFilename);

const writeState = state => writeJSONSync(stateFilename, state);

const setInitialState = () => writeState({});

const ensureStateFile = () => {
  if (!existsSync(stateFilename)) {
    ensureFileSync(stateFilename);
    setInitialState();
  }
};

ensureStateFile();

// FIXME: these functions are never used
class DeploymentSetup {
  constructor(setup, deployer) {
    this.deployer = deployer;
    this.setup = setup;
    this.context = {};
  }

  async deploy() {
    const contracts = {};
    const signer = await getSigner();
    // console.log('About to deploy', this.setup.contracts.length, 'contracts')
    for (const cfg of this.setup.contracts) {
      // console.log('Deploying', cfg.name)
      contracts[cfg.name] = await this.deployContract({ ...cfg, signer });
      // console.log('Deployed', cfg.name)
    }
    return contracts;
  }

  async deployContract(contractConfig) {
    const {
      name,
      params,
      signer,
      context,
      artifact,
      after,
      address
    } = contractConfig;

    // build local context
    // let ctx = {};
    if (address === undefined) {
      const ctx = { ...this.context, ...context };
      const values = typeof params === 'function' ? params(ctx) : params;

      const [contract, receipt] = await deploy(
        artifact === undefined ? name : artifact,
        values === undefined ? [] : values,
        signer
      );

      this.context[name] = {
        address: contract.address,
        contract,
        receipt
      };
    } else {
      const contract = getContractInstance(
        artifact === undefined ? name : artifact,
        address,
        signer
      );
      this.context[name] = {
        address: contract.address,
        contract
      };
    }

    // TODO : store events in context?
    this.context[name] = {
      address: contract.address,
      contract,
      receipt
    };

    if (after !== undefined) {
      // store return value into context?
      await after(contract, receipt, ctx);
    }

    return contract;
  }
}

function getDeploymentSetup(setup, deployer) {
  return new DeploymentSetup(setup, deployer);
}

async function getDeployedAddresses(name, chainId) {
  if (contractAddresses) {
    return contractAddresses[name]
  }
  const state = readState();
  chainId = await getChainId(chainId);

  if (!isDeployed(state, chainId, name)) {
    // chainId wasn't used before or contract wasn't deployed
    return [];
  }

  return state[chainId][name];
}

async function getLastDeployedContract(name, chainId) {
  return (await getDeployedContractsGenerator(name, chainId).next()).value;
}

async function getDeployedContracts(name, chainId) {
  const contractGenerator = getDeployedContractsGenerator(name, chainId);
  const contracts = [];
  for await (let contract of contractGenerator) {
    contracts.push(contract)
  }
  return contracts;
}

async function* getDeployedContractsGenerator(name, chainId) {
  const factory = await getContractFactory(name);
  const addresses = await getDeployedAddresses(name, chainId);
  const artifact = artifacts.readArtifactSync(name);

  if (artifact.bytecode !== factory.bytecode) {
    console.warn(
      'Deployed contract',
      name,
      ' does not match compiled local contract'
    );
  }

  // Load OpenZeppelin's artifacts
  // Done temporarily as the contracts were deployed before the integration with hardhat
  let adminUpgradeabilityProxyDeployedCode = "", proxyAdminDeployedCode = "";
  if (await artifacts.artifactExists("AdminUpgradeabilityProxy")) {
    const adminUpgradeabilityProxyArtifact = artifacts.readArtifactSync("AdminUpgradeabilityProxy");
    adminUpgradeabilityProxyDeployedCode = adminUpgradeabilityProxyArtifact.deployedBytecode;
  }

  if (await artifacts.artifactExists("ProxyAdmin")) {
    const proxyAdminArtifact = artifacts.readArtifactSync("ProxyAdmin");
    proxyAdminDeployedCode = proxyAdminArtifact.deployedBytecode;
  }

  for (const addr of addresses) {
    // Checks that on the current network the contracts are deployed
    const code = await ethers.provider.getCode(addr);
    const contract = factory.attach(addr);
    if (code === artifact.deployedBytecode ||
      code === AdminUpgradeabilityProxy.deployedBytecode ||
      code === ProxyAdmin.deployedBytecode ||
      code === adminUpgradeabilityProxyDeployedCode ||
      code === proxyAdminDeployedCode
    ) {
      yield contract;
    }
  }
}

async function getImplContract(contract, contractName) {
  if (await isProxy(contract)) {
    const implAddr = await getImplementationAddress(ethers.provider, contract.address);
    const contractFactory = await ethers.getContractFactory(contractName);
    return contractFactory.attach(implAddr);
  }
  throw new Error("The contract is not a Proxy")
}

async function isProxy(contract) {
  const addr = contract.address;
  const code = await ethers.provider.getCode(addr);

  return code === AdminUpgradeabilityProxy.deployedBytecode;
}

async function saveDeployedContract(name, instance) {
  const state = readState();
  if (name === undefined) {
    throw new Error('saving contract with no name');
  }

  const chainId = await getChainId();
  const instanceAddress = instance.address;

  // is it already deployed?
  if (isDeployed(state, chainId, name)) {
    const [last, ...previous] = state[chainId][name];

    if (last !== instanceAddress) {
      // place the new instance address first to the list
      state[chainId][name] = [instanceAddress, last, ...previous];
    }
  } else {
    const addresses = [instanceAddress];
    // check if the chain is defined.
    if (state[chainId] === undefined) {
      // place the first contract with this chainId
      state[chainId] = {
        [name]: addresses
      };
    } else {
      // just add the new contract to the state.
      state[chainId][name] = addresses;
    }
  }

  // update state
  writeState(state);
}

async function saveSigner(signer) {
  const state = readState();
  if (signer === undefined) {
    throw new Error('saving undefined signer');
  }

  const chainId = await getChainId();
  
  const lastSignerFieldName = "lastSigner";
  const signerAddress = await signer.getAddress();
  state[chainId][lastSignerFieldName] = signerAddress;

  // update state
  writeState(state);
}

async function deploy(contractName, params, signer) {
  const validations = await readValidations(config);
  const factory = await getContractFactory(
    contractName,
    signer
  );

  const unlinkedBytecode = getUnlinkedBytecode(validations, factory.bytecode);
  const version = getVersion(unlinkedBytecode, factory.bytecode);

  let txHash;
  const contractAddress = await fetchOrDeploy(version, signer.provider, async () => {
    const { address, deployTransaction } = await factory.deploy(...params);
    txHash = deployTransaction.hash;
    const layout = getStorageLayout(validations, version);
    return { address, txHash, layout };
  }, true);

  const contract = await getContractInstance(contractName, contractAddress, signer)

  const receipt = await ethers.provider.getTransactionReceipt(
    txHash
  );
  return [contract, receipt];
}


async function deployProxy(contractName, params, signer, opts) {
  const factory = await ethers.getContractFactory(contractName, await getSigner(signer));

  const contract = await upgrades.deployProxy(factory, params, { ...opts, unsafeAllowCustomTypes: true });
  await contract.deployed();

  const receipt = await ethers.provider.getTransactionReceipt(
      contract.deployTransaction.hash
  );
  return [contract, receipt];
}

async function getOrDeployContract(contractName, params, signer = undefined, reset = false) {
  if (!HIDE_LOGS) logger.info(
      `[deployments] :: Entering getOrDeployContract. Contract ${contractName} with args [${params}].`
  );
  let contract = await getLastDeployedContract(contractName);
  if (contract === undefined || reset === true) {
    if (!HIDE_LOGS) logger.info(`[deployments] :: ${contractName} not found, deploying...`);
    [contract] = await deploy(contractName, params, signer);
    await saveDeployedContract(contractName, contract, signer);
    if (!HIDE_LOGS) logger.info(`[deployments] :: ${contractName} deployed.`);
  }
  return contract;
}

function buildGetOrDeployUpgradeableContract(
  readArtifactSyncFun = null
) {
  return async function getOrDeployUpgradeableContract(
    contractName,
    params,
    signer = undefined,
    options = undefined,
    reset = false
  ) {
    if (!HIDE_LOGS) logger.info(
      `[deployments] :: Entering getOrDeployUpgradeableContract. Contract ${contractName} with args [${params}].`
    );
    let contract = await getLastDeployedContract(contractName);
    if (contract === undefined || reset === true) {
      if (!HIDE_LOGS) logger.info(`[deployments] :: ${contractName} not found, deploying...`);
      [contract] = await deployProxy(
        contractName,
        params,
        signer,
        options
      );
      await saveDeployedContract(contractName, contract);
      if (!HIDE_LOGS) logger.info(`[deployments] :: ${contractName} deployed.`);
    } else {
      if (!HIDE_LOGS) logger.info(
        `[deployments] :: ${contractName} found, checking if an upgrade is needed`
      );
      const implContract = await getImplContract(
        contract,
        contractName
      );

      // Having readArtifactSyncFun = artifacts.readArtifactSync somehow doesn't work
      let artifact;
      if (!!readArtifactSyncFun) {
        artifact = readArtifactSyncFun(contractName);
      } else {
        artifact = artifacts.readArtifactSync(contractName);
      }

      const implCode = await ethers.provider.getCode(implContract.address);
      if (implCode !== artifact.deployedBytecode)
        throw new Error(`The contract ${contractName} needs an upgrade`)
    }
    return contract;
  }
}

function buildUpgradeContract(upgradeFunction = upgrades.upgradeProxy) {
  return async function upgradeContract(contractAddress, newImplementationName, options, saveContract = true) {
    // Complete options
    options.unsafeAllowCustomTypes = true;
    options.contractName = newImplementationName;

    // Upgrade contract
    const newImplementationFactory = await getContractFactory(newImplementationName);
    const upgradedContract = await upgradeFunction(contractAddress, newImplementationFactory, options);

    // Call update initialization function
    if (options.upgradeContractFunction) {
      await upgradedContract[options.upgradeContractFunction](...options.upgradeContractFunctionParams);
    }

    // Save deployed contract
    if (saveContract) await saveDeployedContract(options.contractName, upgradedContract);
    return upgradedContract;
  }
}

async function deployContracts(
  signer = undefined,
  resetStates = false,
  resetAllContracts = false,
  // Null value signifies deploy all
  contractsToDeploy = null
) {
  const resetProxies = resetStates || resetAllContracts;

  const claimsRegistryName = 'ClaimsRegistry';
  const projectsRegistryName = 'ProjectsRegistry';

  let proxyAdminAddress;
  if (!contractsToDeploy || contractsToDeploy.includes(claimsRegistryName)) {
    const registry = await getOrDeployUpgradeableContract(
      claimsRegistryName,
      [],
      signer,
      { initializer: 'registryInitialize' },
      resetProxies
    );

    proxyAdminAddress = await getAdminAddress(signer.provider, registry.address);
  }

  if (!contractsToDeploy || contractsToDeploy.includes(projectsRegistryName)) {
    const registry = await getOrDeployUpgradeableContract(
      projectsRegistryName,
      [],
      signer,
      { initializer: 'registryInitialize' },
      resetProxies
    );

    proxyAdminAddress = await getAdminAddress(signer.provider, registry.address);
  }

  if (!!proxyAdminAddress) {
    await saveDeployedContract("ProxyAdmin", { address: proxyAdminAddress }, signer);
  }

  await saveSigner(signer);
}

async function upgradeToV1(
  signer = undefined,
  resetStates = false,
  resetAllContracts = false,
  contractsToUpgrade = null
) {
  const resetProxies = resetStates || resetAllContracts;

  const claimsRegistryV1Name = 'ClaimsRegistryV1ForTests';
  const projectRegistryV1Name = 'ProjectsRegistryV1ForTests';

  if (!contractsToUpgrade || contractsToUpgrade.includes(claimsRegistryV1Name)) {
    // upgrade Registry
    const currentRegistryContract = await getLastDeployedContract(claimsRegistryV1Name);
    const registryVersion = await getContractVersion(currentRegistryContract);
    if (resetProxies || registryVersion === 0) {
      const registryV0 = await getLastDeployedContract('ClaimsRegistry');
      const registryUpgradeOptions = {
        upgradeContractFunction: 'claimUpgradeToV1',
        upgradeContractFunctionParams: [
          signer._address,
          'mock-variable-value-claims'
        ]
      };

      await upgradeContract(
        registryV0.address,
        claimsRegistryV1Name,
        registryUpgradeOptions
      );
    } else {
      if (!HIDE_LOGS) logger.info(
        '[deployments] :: ClaimsRegistry contract is already on version 1'
      );
    }
  }

  if (!contractsToUpgrade || contractsToUpgrade.includes(projectRegistryV1Name)) {
    // upgrade ProjectRegistry
    const currentProjectRegistryContract = await getLastDeployedContract(projectRegistryV1Name);
    const projectRegistryVersion = await getContractVersion(currentProjectRegistryContract);
    if (resetProxies || projectRegistryVersion === 0) {
      const projectRegistryV0 = await getLastDeployedContract('ProjectsRegistry');
      const projectRegistryUpgradeOptions = {
        upgradeContractFunction: 'registryUpgradeToV1',
        upgradeContractFunctionParams: [
          signer._address,
          'mock-variable-value-projects'
        ]
      }

      await upgradeContract(
        projectRegistryV0.address,
        projectRegistryV1Name,
        projectRegistryUpgradeOptions
      );
    } else {
      if (!HIDE_LOGS) logger.info(
        '[deployments] :: ProjectRegistry contract is already on version 1'
      );
    }
  }

  await saveSigner(signer);
}

async function upgradeToCurrentImpl(
  signer = undefined,
  contractsToUpgrade = null
) {
  if (!contractsToUpgrade || contractsToUpgrade.includes('ClaimsRegistry')) {
    // upgrade Registry
    const currentRegistryContract = await getLastDeployedContract('ClaimsRegistry');
    if (currentRegistryContract) {
      await upgradeContract(
        currentRegistryContract.address,
        'ClaimsRegistry',
        {}
      );
    } else if (!HIDE_LOGS) logger.info(
      '[deployments] :: No deployed ClaimsRegistry contract to upgrade'
    );
  }

  if (!contractsToUpgrade || contractsToUpgrade.includes('ProjectsRegistry')) {
    // upgrade ProjectRegistry
    const currentProjectRegistryContract = await getLastDeployedContract('ProjectsRegistry');

    if (currentProjectRegistryContract) {
      await upgradeContract(
        currentProjectRegistryContract.address,
        'ProjectsRegistry',
        {}
      );
    } else if (!HIDE_LOGS) logger.info(
      '[deployments] :: No deployed ProjectsRegistry contract to upgrade'
    );
  }

  await saveSigner(signer);
}

async function getContractVersion(contract) {
  let version;
  try {
    version = await contract.version();
  } catch (e) {
    version = 0;
  }
  return version;
}

async function getContractInstance(name, address, signer) {
  const factory = await getContractFactory(name, signer);

  return factory.attach(address);
}

async function getContractFactory(name, signer) {
  signer = await getSigner(signer);
  // console.log('Deployer', await signer.getAddress());
  const { abi, bytecode } = await artifacts.readArtifact(name);
  return new ContractFactory(abi, bytecode, signer);
}

async function getChainId(chainId) {
  if (chainId === undefined) {
    return network.config.chainId;
  }
  return chainId;
}

async function getAccounts() {
  return ethers.provider.listAccounts()
}

async function getSigner(account) {
  const provider = await getProvider();
  const accounts = await getAccounts();
  // TODO: Is it okay return account?
  let signer = account;
  if (account === undefined) {
    signer = provider.getSigner(accounts[0]);
  } else if (typeof account === "number") {
    signer = provider.getSigner(accounts[account]);
  } else if (typeof account === 'string') {
    signer = provider.getSigner(account);
  }
  return signer;
}

async function getProvider() {
  return gsnConfig.isEnabled ? await getGSNProvider() : ethers.provider;
}


async function getGSNProvider() {
  const ownerAddress = (await getAccounts())[0];

  const gsnProvider = new GSNProvider(web3, {
    ownerAddress,
    useGSN: true
  });

  return new ethers.providers.Web3Provider(gsnProvider);
}

function isDeployed(state, chainId, name) {
  return (
    state[chainId] !== undefined &&
    state[chainId][name] !== undefined &&
    state[chainId][name].length > 0
  );
}

const getOrDeployUpgradeableContract = buildGetOrDeployUpgradeableContract()
const upgradeContract = buildUpgradeContract();

module.exports = {
  deploy,
  deployProxy,
  getSigner,
  getProvider,
  getAccounts,
  getDeployedContracts,
  saveDeployedContract,
  getLastDeployedContract,
  getContractInstance,
  getContractFactory,
  getImplContract,
  isProxy,
  getDeploymentSetup,
  getOrDeployContract,
  buildGetOrDeployUpgradeableContract,
  getOrDeployUpgradeableContract,
  upgradeContract,
  deployContracts,
  upgradeToV1,
  upgradeToCurrentImpl
};
