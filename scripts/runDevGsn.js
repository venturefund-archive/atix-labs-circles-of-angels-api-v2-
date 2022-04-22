const Web3 = require('web3');
const { deployRelayHub, runRelayer } = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');

const PROVIDER_URL = 'http://localhost:8545';

async function runGSN() {
  const gsnWeb3 = new Web3(PROVIDER_URL);
  const hubAddress = await deployRelayHub(gsnWeb3, {});
  await runRelayer({
    ...testConfig.relayer,
    relayHubAddress: hubAddress
  });
}

module.exports = {
  runGSN
};
