require('@nomiclabs/hardhat-truffle5');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-web3');
require('@nomiclabs/hardhat-solhint');
require('solidity-coverage');

const { lazyObject } = require('hardhat/plugins');

const config = require('config');
const { COA } = require('./src/plugins/coa');

// Hardhat tasks files
require('./src/rest/services/helpers/hardhatTasks');
require('./src/rest/services/helpers/hardhatProjectTasks');
require('./src/rest/services/helpers/hardhatClaimTasks');

// eslint-disable prefer-destructuring
// eslint-disable-next-line no-undef
extendEnvironment(env => {
  // eslint-disable-next-line no-param-reassign
  env.coa = new COA(env);
  // eslint-disable-next-line no-param-reassign
  env.deployments = lazyObject(() => require('./src/plugins/deployments'));
});

const chainIds = {
  hardhat: 31337,
  rskMainnet: 30,
  rskTestnet: 31
};

module.exports = {
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    tests: './src/tests/contracts',
    sources: './src/contracts'
  },
  defaultNetwork: config.hardhat.defaultNetwork || 'hardhat',
  networks: {
    testnet: {
      url: config.hardhat.testnet_url,
      accounts: [config.hardhat.testnet_account],
      timeout: 8 * 60 * 1000,
      chainId: chainIds.rskTestnet
    },
    mainnet: {
      url: config.hardhat.mainnet_url,
      accounts: [config.hardhat.mainnet_account],
      timeout: 8 * 60 * 1000,
      chainId: chainIds.rskMainnet
    },
    // Local deployments, tests & coverage
    hardhat: {
      accounts: [
        {privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", balance: "10000000000000000000000"},
        {privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", balance: "10000000000000000000000"},
        {privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", balance: "10000000000000000000000"},
        {privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", balance: "10000000000000000000000"}
      ],
      chainId: chainIds.hardhat,
      gasPrice: 10,
      initialBaseFeePerGas: 0,
      blockGasLimit: 999999999999999,
      loggingEnabled: true,
      throwOnTransactionFailures: true
    }
  },
  solidity: {
    version: '0.5.8',
    settings: {
      evmVersion: 'byzantium',
      optimizer: {
        enabled: true,
        runs: 1
      }  
    }
  }
};
