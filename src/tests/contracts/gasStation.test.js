/* eslint-disable no-console */
const { describe, it, before, beforeEach, after } = global;
const { run, deployments, ethers, web3 } = require('@nomiclabs/buidler');
const { deployRelayHub, runRelayer } = require('@openzeppelin/gsn-helpers');
const { testConfig, gsnConfig } = require('config');
const { GSNDevProvider, utils } = require('@openzeppelin/gsn-provider');

const chai = require('chai');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

const { throwsAsync, waitForEvent } = require('./helpers/testHelpers');

const { fundRecipient } = require('../../rest/services/helpers/gsnHelper');

const { isRelayHubDeployedForRecipient } = utils;

const PROVIDER_URL = ethers.provider.connection.url;
const fundValue = '1000000000000000000';

// TODO: this funciton was copied from the claim registry tests
//       keeping it now as this whole file will be deleted once we stop supporting GSNs
const addClaim = async (
  claimsRegistry,
  theClaim = {
    claim: 'this is a claim',
    proof: 'this is the proof',
    milestone: 'the milestone',
    approved: true
  }
) => {
  const { claim, proof, milestone, approved } = theClaim;
  const claimHash = ethers.utils.id(claim || 'this is a claim');
  const proofHash = ethers.utils.id(proof || 'this is the proof');
  const milestoneHash = ethers.utils.id(milestone || 'this is the milestone');
  await claimsRegistry.addClaim(
    // TODO: using any valid address for now as the project address, as this file will be deleted
    claimsRegistry.address,
    claimHash,
    proofHash,
    approved,
    milestoneHash
  );
  return {
    claimHash,
    proofHash,
    approved,
    milestoneHash
  };
};

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
    await claimsRegistry.setWhitelist(whitelist.address);

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
    chai.assert.equal(await claimsRegistry.getHubAddr(), gsnConfig.relayHubAddress);
    const isClaimsRegistryReady = await isRelayHubDeployedForRecipient(web3, claimsRegistry.address);
    chai.assert.equal(isClaimsRegistryReady, true);
  });

  describe('GSN enabled ', () => {
    const gsnDevProvider = new GSNDevProvider(PROVIDER_URL, {
      ownerAddress,
      relayerAddress,
      useGSN: true
    });

    const provider = new ethers.providers.Web3Provider(gsnDevProvider);
    async function getGsnClaimRegistry() {
      return await deployments.getContractInstance(
        'ClaimsRegistry',
        claimsRegistry.address,
        provider.getSigner(signerAddress)
      );
    }

    it('should execute registry TX for FREE from a user in whitelist', async () => {
      await whitelist.addUser(signerAddress);
      const gsnRegistry = await getGsnClaimRegistry();
      const oldBalance = await gsnRegistry.provider.getBalance(signerAddress);
      await addClaim(gsnRegistry);

      // Check that the claim was successfully done
      await waitForEvent(gsnRegistry, 'ClaimApproved');

      // Check that the balance of the user wasnm't altered
      const newBalance = await gsnRegistry.provider.getBalance(signerAddress);
      chai.assert.equal(oldBalance.toString(), newBalance.toString());
    });

    it('should not execute registry TX from a user is not in whitelist', async () => {
      const gsnRegistry = await getGsnClaimRegistry();
      const oldBalance = await gsnRegistry.provider.getBalance(signerAddress);

      await throwsAsync(
        addClaim(gsnRegistry),
        'Error: Recipient canRelay call was rejected with error 11'
      );
      const newBalance = await gsnRegistry.provider.getBalance(signerAddress);
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

    it('should execute registry TX from a user in whitelist spending his founds', async () => {
      await whitelist.addUser(signerAddress);
      const gsnRegistryOff = await deployments.getContractInstance(
        'ClaimsRegistry',
        claimsRegistry.address,
        provider.getSigner(signerAddress)
      );
      const oldBalance = await gsnRegistryOff.provider.getBalance(signerAddress);
      await addClaim(gsnRegistryOff);
      const newBalance = await gsnRegistryOff.provider.getBalance(signerAddress);
      chai.assert.isTrue(newBalance.lt(oldBalance));
    });
  });
});
