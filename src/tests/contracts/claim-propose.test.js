const { it, beforeEach } = global;
const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { proposeClaim } = require('./helpers/claimRegistryHelpers');
const { commonErrors, getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { throwsAsync } = require('./helpers/testHelpers');

chai.use(solidity);

contract('ClaimsRegistry.sol - audit a claim', ([txSender]) => {
  let registry;
  const projectId = 666;
  let proposerSigner, proposerAddress;
  let otherProposerSigner, otherProposerAddress;
  const proposal = {
    claim: 'this is a claim',
    proof: 'this is the proof',
    activityId: 42,
    proposerEmail: "proposer@email.com"
  }

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
    otherProposerSigner = signers[2];
    otherProposerAddress = await otherProposerSigner.getAddress();
  });

  it('Should allow a proposer to propose a claim', async () => {
    const { claimHash, proofHash} = await proposeClaim(
      registry,
      projectId,
      proposerSigner,
      proposal
    );

    // Proposal is stored properly
    const claimProposal = await registry.registryProposedClaims(projectId, proposerAddress, claimHash);
    assert.equal(claimProposal.proof, proofHash);
    assert.equal(claimProposal.activityId, proposal.activityId);
    assert.equal(claimProposal.proposerAddress, proposerAddress);
    assert.equal(claimProposal.proposerEmail, proposal.proposerEmail);
  });

  it('Should allow a proposer to override his claim', async () => {
    const { claimHash, proofHash1} = await proposeClaim(
      registry,
      projectId,
      proposerSigner,
      proposal
    );

    const newProposal = Object.assign({}, proposal);
    newProposal.proof = 'this is the new proof';
    const { proofHash : proofHash2} = await proposeClaim(
        registry,
        projectId,
        proposerSigner,
        newProposal
      );

    assert.notEqual(proofHash1, proofHash2)

    // Proposal is updated properly
    const updatedClaimProposal = await registry.registryProposedClaims(projectId, proposerAddress, claimHash);
    assert.equal(updatedClaimProposal.proof, proofHash2);
  });

  it('Should allow multiple proposals for the same claim but different sender to coexist', async () => {
    const { claimHash : claimHash1, proofHash : proofHash1} = await proposeClaim(
        registry,
        projectId,
        proposerSigner
      );

    const { claimHash : claimHash2, proofHash : proofHash2} = await proposeClaim(
        registry,
        projectId,
        otherProposerSigner
      );

    assert.equal(claimHash1, claimHash2);
    assert.equal(proofHash1, proofHash2);

    // Both proposals exists
    const claimProposal1 = await registry.registryProposedClaims(projectId, proposerAddress, claimHash1);
    assert.equal(claimProposal1.proof, proofHash1);
    const claimProposal2 = await registry.registryProposedClaims(projectId, otherProposerAddress, claimHash1);
    assert.equal(claimProposal2.proof, proofHash1);
  });

  it('Should fail when sender is not the a owner', async () => {    
    await throwsAsync(
      proposeClaim(registry, projectId, proposerSigner, proposal, proposerSigner),
      getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
    );
  });
});
