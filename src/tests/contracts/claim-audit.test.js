const { it, beforeEach } = global;
const { utils } = require('ethers');
const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { throwsAsync, waitForEvent } = require('./helpers/testHelpers');
const { claimRegistryErrors, proposeClaim, submitClaimAuditResult } = require('./helpers/claimRegistryHelpers')

chai.use(solidity);

contract('ClaimsRegistry.sol - audit a claim', ([txSender]) => {
  let registry;
  const projectId = 666;
  let proposerAddress;
  let auditorSigner, auditorAddress;
  let claimHash, proofHash;
  let claimProposal;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts and create proposal', async function be() {
    // Deploy contracts
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');

    // Create proposal
    const signers = await ethers.getSigners();
    const proposerSigner = signers[1];
    proposerAddress = await proposerSigner.getAddress();
    const claimProposalHashes = await proposeClaim(registry, projectId, proposerSigner);
    claimHash = claimProposalHashes.claimHash;
    proofHash = claimProposalHashes.proofHash;
    claimProposal = await registry.registryProposedClaims(projectId, proposerAddress, claimHash);

    auditorSigner = signers[2];
    auditorAddress = await auditorSigner.getAddress();
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
    const claimAudit = await registry.registryAuditedClaims(projectId, auditorAddress, claimHash);
    assert.equal(claimAudit.auditorAddress, auditorAddress);
    assert.equal(claimAudit.approved, approved);

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
    const claimAudit = await registry.registryAuditedClaims(projectId, auditorAddress, claimHash);
    assert.equal(claimAudit.auditorAddress, auditorAddress);
    assert.equal(claimAudit.approved, approved);

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
