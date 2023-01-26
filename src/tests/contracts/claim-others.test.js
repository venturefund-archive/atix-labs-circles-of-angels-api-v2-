const { it, beforeEach } = global;
const { deployments, web3, ethers } = require('hardhat');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { claimRegistryErrors, proposeAndAuditClaim } = require('./helpers/claimRegistryHelpers');
const { getVmRevertExceptionWithMsg, throwsAsync } = require('./helpers/exceptionHelpers');
const { redeployContracts } = require('./helpers/deployHelpers');

chai.use(solidity);

contract('ClaimsRegistry.sol - remainder flows (queries)', ([txSender]) => {
  let registry;
  const projectId = '666';
  let proposerSigner, proposerAddress;
  let auditorSigner, auditorAddress;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function () {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);

    // Deploy contracts
    await redeployContracts(['ClaimsRegistry']);
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');

    // Create signers
    const signers = await ethers.getSigners();
    proposerSigner = signers[1];
    proposerAddress = await proposerSigner.getAddress();

    auditorSigner = signers[2];
    auditorAddress = await auditorSigner.getAddress();
  });

  it('It should return true when checking for only approved claims', async () => {
    const { claimHash: claim1Hash } = await proposeAndAuditClaim(registry, projectId, proposerSigner, auditorSigner, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await proposeAndAuditClaim(registry, projectId, proposerSigner, auditorSigner, {
      claim: 'claim 2',
      approved: true
    });

    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    // Check both are approved
    const approved = await registry.areApproved(
      projectId,
      [auditorAddress, auditorAddress],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, true);
  });

  it('It should return false when checking if one of the claims is not approved', async () => {
    const { claimHash: claim1Hash } = await proposeAndAuditClaim(registry, projectId, proposerSigner, auditorSigner, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await proposeAndAuditClaim(registry, projectId, proposerSigner, auditorSigner, {
      claim: 'claim 2',
      approved: false
    });

    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    // Check that both aren't approved
    const approved = await registry.areApproved(
      projectId,
      [auditorAddress, auditorAddress],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, false);
  });

  it('It should return fail when checking for approvals but with auditors and claim hashes of different size', async () => {
    await throwsAsync(
      registry.areApproved(
        projectId,
        [auditorAddress, auditorAddress],
        [ethers.utils.id("claim1Hash")]
      ),
      getVmRevertExceptionWithMsg(claimRegistryErrors.areApprovedWithArraysDifSize)
    );
  });

  // Note: this set was bigger, but it was reduced due to timeouts on the CI
  it('It should handle large set of claims to be checked', async () => {
    const claims = [];
    const validators = [];
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      const { claimHash } = await proposeAndAuditClaim(registry, projectId, proposerSigner, auditorSigner, {
        claim: `claim ${i}`,
        approved: true
      });
      claims.push(claimHash);
      validators.push(auditorAddress);
    }
    const approved = await registry.areApproved(projectId, validators, claims);
    assert.equal(approved, true);
  });

  it('It should revert when sending a tx to the contract', async () => {
    await chai.expect(
      web3.eth.sendTransaction({
        from: txSender,
        to: registry.address,
        value: '0x16345785d8a0000'
      })
    ).to.be.reverted;
  });
});
