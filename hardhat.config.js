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

module.exports = {
  paths: {
    tests: './src/tests/contracts',
    sources: './src/contracts'
  },
  defaultNetwork: config.hardhat.defaultNetwork || 'develop',
  networks: {
    develop: {
      url: 'http://localhost:8545',
      blockGasLimit: 8000000
    },
    testnet: {
      url: config.hardhat.testnet_url,
      accounts: [config.hardhat.testnet_account],
      timeout: 8 * 60 * 1000,
      chainId: 31
    },
    mainnet: {
      url: config.hardhat.mainnet_url,
      accounts: [config.hardhat.mainnet_account],
      timeout: 8 * 60 * 1000,
      chainId: 30
    },
    coverage: {
      url: 'http://localhost:8555'
    },
    hardhat: {
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
