const { it, beforeEach } = global;
const { run, deployments, web3, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const { Wallet } = require('ethers');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { waitForEvent } = require('./helpers/testHelpers');
const { relayClaim } = require('./helpers/claimRegistryHelpers')

chai.use(solidity);

contract('ClaimsRegistry.sol', ([txSender]) => {
  let registry;
  let { address : projectAddress} = Wallet.createRandom();
  let auditorSigner;
  let auditorAddress;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');

    auditorSigner = (await ethers.getSigners())[1];
    auditorAddress = await auditorSigner.getAddress();
  });

  it('Should add a claim and emit an event when doing so', async () => {
    const { proofHash, claimHash, approved, milestoneHash } = await relayClaim(
      registry,
      projectAddress,
      auditorSigner
    );

    const claim = await registry.registry(projectAddress, auditorAddress, claimHash);
    const [
      eventProject,
      eventValidator,
      eventClaim,
      eventApproved,
      eventProof,
      ,
      eventMilestone
    ] = await waitForEvent(registry, 'ClaimAudited');

    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, approved);
    // `claim Approved event is emitted properly
    assert.equal(eventProject, projectAddress);
    assert.equal(eventValidator, auditorAddress);
    assert.equal(eventClaim, claimHash);
    assert.equal(eventApproved, approved);
    assert.equal(eventProof, proofHash);
    assert.equal(eventMilestone.toHexString(), milestoneHash);
  });

  it('Should override a claim when adding it twice', async () => {
    const { proofHash, claimHash } = await relayClaim(registry, projectAddress, auditorSigner);
    const claim = await registry.registry(projectAddress, auditorAddress, claimHash);
    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, true);
    // Update the claim
    const { proofHash: proof2Hash } = await relayClaim(registry, projectAddress, auditorSigner, {
      approved: false,
      proof: 'another proof'
    });
    const claim2 = await registry.registry(projectAddress, auditorAddress, claimHash);
    // Check the claim hash changed
    assert.equal(claim2.proof, proof2Hash);
    assert.equal(claim2.approved, false);
  });

  it('It should return true when checking for only approved claims', async () => {
    const { claimHash: claim1Hash } = await relayClaim(registry, projectAddress, auditorSigner, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await relayClaim(registry, projectAddress, auditorSigner, {
      claim: 'claim 2',
      approved: true
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      projectAddress,
      [auditorAddress, auditorAddress],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, true);
  });

  it('It should return false when checking if one of the claims is not approved', async () => {
    const { claimHash: claim1Hash } = await relayClaim(registry, projectAddress, auditorSigner, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await relayClaim(registry, projectAddress, auditorSigner, {
      claim: 'claim 2',
      approved: false
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      projectAddress,
      [auditorAddress, auditorAddress],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, false);
  });
  it('It should handle large set of claims to be checked', async () => {
    const claims = [];
    const validators = [];
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line no-await-in-loop
      const { claimHash } = await relayClaim(registry, projectAddress, auditorSigner, {
        claim: `claim ${i}`,
        approved: true
      });
      claims.push(claimHash);
      validators.push(auditorAddress);
    }
    const approved = await registry.areApproved(projectAddress, validators, claims);
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
