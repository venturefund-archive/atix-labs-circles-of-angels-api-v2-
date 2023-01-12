const Web3 = require('web3');

const { exec, execSync } = require('child_process');
const { testConfig, gsnConfig } = require('config');
const { runGSN } = require('./runDevGsn');
const Logger = require('../src/rest/logger');

async function waitUntilNodeIsUp(host) {
  const web3 = new Web3(new Web3.providers.HttpProvider(host));

  do {
    try {
      // eslint-disable-next-line no-await-in-loop
      if (await web3.eth.net.isListening()) {
        break;
      } else {
        Logger.error('Not connected for some reason');
      }
    } catch (e) {
      execSync('sleep 0.5');
    }
  } while (true);
}

async function runNode() {
  exec('npm run node >> /dev/null');

  await waitUntilNodeIsUp('http://localhost:8545');
}

module.exports = async () => {
  Logger.info('Running jest global setup');
  if (testConfig.hardhatNode.runOnTest) {
    await runNode();
  }
  if (gsnConfig.isEnabled && testConfig.relayer.runOnTest) {
    await runGSN();
  }
  Logger.info('Jest global setup finished');
};
