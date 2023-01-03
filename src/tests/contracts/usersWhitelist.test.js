const { describe, it, before, beforeEach, after } = global;
const { run, deployments } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const Web3 = require('web3');
const { deployRelayHub, runRelayer } = require('@openzeppelin/gsn-helpers');
const { testConfig } = require('config');

const { fundRecipient } = require('../../rest/services/helpers/gsnHelper');

const PROVIDER_URL = 'http://localhost:8545';

contract('UsersWhitelist.sol', accounts => {
  const [
    creator,
    userRelayer,
    other,
    ownerAddress,
    relayerAddress,
    signerAddress
  ] = accounts;
  let projectRegistry;
  let whitelist;
  let subprocess;
  let gsnWeb3;
  let hubAddress;
  before('Gsn provider run', async function b() {
    gsnWeb3 = new Web3(PROVIDER_URL);
    hubAddress = await deployRelayHub(gsnWeb3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });
  });

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    projectRegistry = await deployments.getLastDeployedContract('ProjectsRegistry');
    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');

    await fundRecipient(gsnWeb3, {
      recipient: projectRegistry.address,
      amount: '100000000000000000',
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function a() {
    if (subprocess) subprocess.kill();
  });

  describe('whitelist ', () => {
    it('Deployment works', async () => {
      const projectsLength = await projectRegistry.getProjectsLength();
      assert.equal(projectsLength, 0);
    });

    it('should add and remove users in whitelist', async () => {
      await whitelist.addUser(signerAddress);
      assert.isTrue(await whitelist.users(signerAddress));
      await whitelist.addUser(other);
      await whitelist.removeUser(signerAddress);
      assert.isTrue(!(await whitelist.users(signerAddress)));
    });
  });
});
