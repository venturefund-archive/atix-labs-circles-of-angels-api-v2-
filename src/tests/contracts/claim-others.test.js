const { it, beforeEach } = global;
const { run, deployments, web3, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { proposeAndAuditClaim } = require('./helpers/claimRegistryHelpers')

chai.use(solidity);

contract('ClaimsRegistry.sol - remainder flows (queries)', ([txSender]) => {
  let registry;
  const projectId = 666;
  let proposerSigner, proposerAddress;
  let auditorSigner, auditorAddress;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    // Deploy contracts
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
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

  // FIXME: this set is not so large due to timeouts on the CI
  it('It should handle large set of claims to be checked', async () => {
    const claims = [];
    const validators = [];
    for (let i = 0; i < 5; i++) {
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
