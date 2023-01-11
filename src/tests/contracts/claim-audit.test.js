const { it, beforeEach } = global;
const { utils } = require('ethers');
const { deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { redeployContracts, throwsAsync, waitForEvent } = require('./helpers/testHelpers');
const { claimRegistryErrors, getClaimAudit, proposeClaim, submitClaimAuditResult } = require('./helpers/claimRegistryHelpers')

chai.use(solidity);

contract('ClaimsRegistry.sol - audit a claim', ([txSender]) => {
  let registry;
  const projectId = 666;
  let proposerSigner, proposerAddress;
  let auditorSigner, auditorAddress;
  let claimProposal = {
    claim: 'a claim',
    proof: 'a proof'
  };
  let claimHash, proofHash;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts and create proposal', async function be() {
    // Deploy contracts
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await redeployContracts(['ClaimsRegistry']);
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');

    // Create signers
    const signers = await ethers.getSigners();
    proposerSigner = signers[1];
    proposerAddress = await proposerSigner.getAddress();
    auditorSigner = signers[2];
    auditorAddress = await auditorSigner.getAddress();

    // Create proposal
    const claimProposalHashes = await proposeClaim(registry, projectId, proposerSigner, claimProposal);
    claimHash = claimProposalHashes.claimHash;
    proofHash = claimProposalHashes.proofHash;
    claimProposal = await registry.registryProposedClaims(projectId, proposerAddress, claimHash);
  });

  it('Should allow an auditor to approve a claim', async () => {
    const approved = true;
    await submitClaimAuditResult(
      registry,
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      approved,
      auditorSigner
    );

    // Audit is stored properly
    const claimAudit = await getClaimAudit(registry, projectId, auditorAddress, claimHash);
    assert.equal(claimAudit.auditorAddress, auditorAddress);
    assert.equal(claimAudit.approved, approved);
    assert.isTrue(claimAudit.wasAudited);

    // Claim audited event is emitted properly
    const [
      eventProject,
      eventAuditor,
      eventClaim,
      eventApproved,
      eventProof,
      ,
      ,
    ] = await waitForEvent(registry, 'ClaimAudited');
    assert.equal(eventProject, projectId);
    assert.equal(eventAuditor, auditorAddress);
    assert.equal(eventClaim, claimHash);
    assert.equal(eventApproved, approved);
    assert.equal(eventProof, proofHash);
  });

  it('Should allow an auditor to reject a claim', async () => {
    const approved = false;
    await submitClaimAuditResult(
      registry,
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      approved,
      auditorSigner
    );

    // Audit is stored properly
    const claimAudit = await getClaimAudit(registry, projectId, auditorAddress, claimHash);
    assert.equal(claimAudit.auditorAddress, auditorAddress);
    assert.equal(claimAudit.approved, approved);
    assert.isTrue(claimAudit.wasAudited);

    // Claim audited event is emitted properly
    const [
      eventProject,
      eventAuditor,
      eventClaim,
      eventApproved,
      eventProof,
      ,
      ,
    ] = await waitForEvent(registry, 'ClaimAudited');
    assert.equal(eventProject, projectId);
    assert.equal(eventAuditor, auditorAddress);
    assert.equal(eventClaim, claimHash);
    assert.equal(eventApproved, approved);
    assert.equal(eventProof, proofHash);
  });

  it('Should not modifify the proposal of an audit even if the original was', async () => {
    const approved = true;
    await submitClaimAuditResult(
      registry,
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      approved,
      auditorSigner
    );

    // Edit the original proposal
    const { claimHash : newClaimHash, proofHash : newProofHash } = await proposeClaim(
      registry,
      projectId,
      proposerSigner,
      { claim: claimProposal.claim, proof: 'different proof' }
    );
    assert.equal(claimHash, newClaimHash);
    assert.notEqual(proofHash, newProofHash);

    // The audit and proposal are not modified
    const claimAudit = await getClaimAudit(registry, projectId, auditorAddress, claimHash);
    assert.equal(claimAudit.proofHash, proofHash);
    assert.equal(claimAudit.auditorAddress, auditorAddress);
    assert.equal(claimAudit.approved, approved);
  });

  it('Should fail when auditing a non existing claim', async () => {
    const nonExistingClaimHash = utils.id('non_existing_claimhash');
    
    await throwsAsync(
      submitClaimAuditResult(
        registry,
        projectId,
        nonExistingClaimHash,
        proofHash,
        proposerAddress,
        true,
        auditorSigner
      ),
      getVmRevertExceptionWithMsg(claimRegistryErrors.proposalAuditedDoesNotExists)
    );
  });

  it('Should fail when auditing a claim with different proof hash', async () => {
    const invalidProofHash = utils.id('different_proofhash');
    
    await throwsAsync(
      submitClaimAuditResult(
        registry,
        projectId,
        claimHash,
        invalidProofHash,
        proposerAddress,
        true,
        auditorSigner
      ),
      getVmRevertExceptionWithMsg(claimRegistryErrors.auditWithInvalidProofHash)
    );
  });

  it('Should fail when auditing a claim twice', async () => {
    await submitClaimAuditResult(
      registry,
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      true,
      auditorSigner
    );
    
    await throwsAsync(
      submitClaimAuditResult(
        registry,
        projectId,
        claimHash,
        proofHash,
        proposerAddress,
        true,
        auditorSigner
      ),
      getVmRevertExceptionWithMsg(claimRegistryErrors.auditAlreadySubmitted)
    );
  });
});
