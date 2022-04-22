const { it, beforeEach } = global;
const { run, deployments, web3 } = require('@nomiclabs/buidler');
const { utils } = require('ethers');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { waitForEvent } = require('./helpers/testHelpers');

chai.use(solidity);

const addClaim = async (
  claimsRegistry,
  project,
  theClaim = {
    claim: 'this is a claim',
    proof: 'this is the proof',
    milestone: 'the milestone',
    approved: true
  }
) => {
  const { claim, proof, milestone, approved } = theClaim;
  const claimHash = utils.id(claim || 'this is a claim');
  const proofHash = utils.id(proof || 'this is the proof');
  const milestoneHash = utils.id(milestone || 'this is the milestone');
  await claimsRegistry.addClaim(
    project,
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

contract('ClaimsRegistry.sol', ([creator]) => {
  let coa;
  let registry;
  let project;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');
    coa = await deployments.getLastDeployedContract('COA');
    await coa.createProject(1, 'a project');
    project = await coa.projects(0);
  });

  it('Should add a claim and emit an event when doing so', async () => {
    const { proofHash, claimHash, approved, milestoneHash } = await addClaim(
      registry,
      project
    );

    const claim = await registry.registry(project, creator, claimHash);
    const [
      eventProject,
      eventValidator,
      eventClaim,
      eventApproved,
      eventProof,
      ,
      eventMilestone
    ] = await waitForEvent(registry, 'ClaimApproved');

    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, approved);
    // `claim Approved event is emitted properly
    assert.equal(eventProject, project);
    assert.equal(eventValidator, creator);
    assert.equal(eventClaim, claimHash);
    assert.equal(eventApproved, approved);
    assert.equal(eventProof, proofHash);
    assert.equal(eventMilestone.toHexString(), milestoneHash);
  });

  it('Should override a claim when adding it twice', async () => {
    const { proofHash, claimHash } = await addClaim(registry, project);
    const claim = await registry.registry(project, creator, claimHash);
    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, true);
    // Update the claim
    const { proofHash: proof2Hash } = await addClaim(registry, project, {
      approved: false,
      proof: 'another proof'
    });
    const claim2 = await registry.registry(project, creator, claimHash);
    // Check the claim hash changed
    assert.equal(claim2.proof, proof2Hash);
    assert.equal(claim2.approved, false);
  });

  it('It should return true when checking for only approved claims', async () => {
    const { claimHash: claim1Hash } = await addClaim(registry, project, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await addClaim(registry, project, {
      claim: 'claim 2',
      approved: true
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      project,
      [creator, creator],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, true);
  });

  it('It should return false when checking if one of the claims is not approved', async () => {
    const { claimHash: claim1Hash } = await addClaim(registry, project, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await addClaim(registry, project, {
      claim: 'claim 2',
      approved: false
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      project,
      [creator, creator],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, false);
  });
  it('It should handle large set of claims to be checked', async () => {
    const claims = [];
    const validators = [];
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line no-await-in-loop
      const { claimHash } = await addClaim(registry, project, {
        claim: `claim ${i}`,
        approved: true
      });
      claims.push(claimHash);
      validators.push(creator);
    }
    const approved = await registry.areApproved(project, validators, claims);
    assert.equal(approved, true);
  });

  it('It should revert when sending a tx to the contract', async () => {
    await chai.expect(
      web3.eth.sendTransaction({
        from: creator,
        to: registry.address,
        value: '0x16345785d8a0000'
      })
    ).to.be.reverted;
  });
});
