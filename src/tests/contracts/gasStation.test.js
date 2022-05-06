/* eslint-disable no-console */
const { describe, it, before, beforeEach, after } = global;
const { run, deployments, ethers, web3 } = require('@nomiclabs/buidler');
const { deployRelayHub, runRelayer } = require('@openzeppelin/gsn-helpers');
const { testConfig, gsnConfig } = require('config');
const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');

const chai = require('chai');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

const { throwsAsync } = require('./helpers/testHelpers');

const { fundRecipient } = require('../../rest/services/helpers/gsnHelper');

const { isRelayHubDeployedForRecipient } = utils;

const PROVIDER_URL = ethers.provider.connection.url;
const fundValue = '1000000000000000000';

async function getProjectAt(address, consultant) {
  return deployments.getContractInstance('Project', address, consultant);
}

contract('Gas Station Network Tests', accounts => {
  const [
    creator,
    userRelayer,
    ownerAddress,
    relayerAddress,
    signerAddress
  ] = accounts;
  let coa;
  let claimsRegistry;
  let superDaoAddress;
  let whitelist;
  let subprocess;
  let hubAddress;

  before('Gsn provider run', async function b() {
    hubAddress = await deployRelayHub(web3, {
      from: userRelayer
    });
    subprocess = await runRelayer({ quiet: true, relayHubAddress: hubAddress });
  });

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    coa = await deployments.getLastDeployedContract('COA');
    claimsRegistry = await deployments.getLastDeployedContract(
      'ClaimsRegistry'
    );

    whitelist = await deployments.getLastDeployedContract('UsersWhitelist');
    await coa.setWhitelist(whitelist.address);

    await fundRecipient(web3, {
      recipient: coa.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });

    await fundRecipient(web3, {
      recipient: claimsRegistry.address,
      amount: fundValue,
      relayHubAddress: hubAddress
    });

    superDaoAddress = await coa.daos(0);
    await fundRecipient(web3, {
      recipient: superDaoAddress,
      amount: fundValue,
      relayHubAddress: hubAddress
    });
  });

  after('finish process', async function a() {
    if (subprocess) subprocess.kill();
  });

  it('initially returns the singleton instance address', async () => {
    chai.assert.equal(await coa.getHubAddr(), gsnConfig.relayHubAddress);
    const isCoaReady = await isRelayHubDeployedForRecipient(web3, coa.address);
    chai.assert.equal(isCoaReady, true);
  });

  describe('GSN enabled ', () => {
    const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress,
      relayerAddress,
      useGSN: true
    });

    const provider = new ethers.providers.Web3Provider(gsnDevProvider);
    const project = {
      id: 1,
      name: 'a good project'
    };

    it('should execute coa TX for FREE from a user in whitelist', async () => {
      await whitelist.addUser(signerAddress);
      const gsnCoa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoa.provider.getBalance(signerAddress);
      await gsnCoa.createProject(project.id, project.name);
      const instance = await getProjectAt(
        await gsnCoa.projects(0),
        provider.getSigner(signerAddress)
      );
      chai.assert.equal(await instance.name(), project.name);
      const newBalance = await gsnCoa.provider.getBalance(signerAddress);
      chai.assert.equal(oldBalance.toString(), newBalance.toString());
    });

    it('should not execute coa TX from a user is not in whitelist', async () => {
      const gsnCoa = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoa.provider.getBalance(signerAddress);

      await throwsAsync(
        gsnCoa.createProject(project.id, project.name),
        'Error: Recipient canRelay call was rejected with error 11'
      );
      const newBalance = await gsnCoa.provider.getBalance(signerAddress);
      chai.assert.equal(oldBalance.toString(), newBalance.toString());
    });
  });

  describe('GSN disabled', () => {
    let gsnDevProvider;
    let provider;
    let project;

    before(async () => {
      gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
        ownerAddress,
        relayerAddress,
        useGSN: false
      });
      provider = new ethers.providers.Web3Provider(gsnDevProvider);
      project = {
        id: 1,
        name: 'a good project'
      };
    });

    it('should execute coa TX from a user in whitelist spending his founds', async () => {
      await whitelist.addUser(signerAddress);
      const gsnCoaOff = await deployments.getContractInstance(
        'COA',
        coa.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      await gsnCoaOff.createProject(project.id, project.name);
      const newBalance = await gsnCoaOff.provider.getBalance(signerAddress);
      chai.assert.isTrue(newBalance.lt(oldBalance));
    });
  });
});
