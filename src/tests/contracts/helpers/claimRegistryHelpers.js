const { utils } = require('ethers');
const { signParameters } = require('./signatureHelpers.js');

const claimRegistryErrors = {
  proposalAuditedDoesNotExists: 'Claim wasn\'t proposed',
  auditAlreadySubmitted: 'Auditor already audited this claim',
  auditWithInvalidProofHash: 'Claim proposal has different proof hash than expected'
}

const proposeClaim = async (
  claimsRegistry,
  projectId,
  proposerSigner,
  {
    claim = 'this is a claim',
    proof = 'this is the proof',
    // Optional parameter with the hash of the proof
    // It overrides the proof parameter 
    proofHash = null,
    activityId = 42,
    proposerEmail = "proposer@email.com"
  } = {},
  senderSigner = null
) => {
  const { claimHash, proofHash : calculatedProofHash } = getClaimHashes(claim, proof);
  // Calculate the proof's hash only if it's not a parameter
  if (!proofHash) {
    proofHash = calculatedProofHash;
  }

  // Obtain the authorization message
  const authorizationMessage = await signParameters(
      ['uint256', 'bytes32', 'string', 'uint256', 'string'],
      [projectId, claimHash, proofHash, activityId, proposerEmail],
      proposerSigner
  )

  if (!!senderSigner) {
    await claimsRegistry
      .connect(senderSigner)
      .proposeClaim(
        projectId,
        claimHash,
        proofHash,
        activityId,
        proposerEmail,
        authorizationMessage
      );
  } else {
    await claimsRegistry.proposeClaim(
      projectId,
      claimHash,
      proofHash,
      activityId,
      proposerEmail,
      authorizationMessage
    );
  }

  return {
    claimHash,
    proofHash
  }
};

const submitClaimAuditResult = async (
    claimsRegistry,
    projectId,
    claimHash,
    proposalProofHash,
    auditIpfsHash,
    proposerAddress,
    approved,
    auditorSigner,
    auditorEmail = "auditor@email.com",
  ) => {
    // Obtain the authorization message
    const authorizationMessage = await signParameters(
        ['uint256', 'bytes32', 'string', 'string', 'address', 'string', 'bool'],
        [projectId, claimHash, proposalProofHash, auditIpfsHash, proposerAddress, auditorEmail, approved],
        auditorSigner
    )


    if (approved) {
      await claimsRegistry.submitClaimApproval(
        projectId,
        claimHash,
        proposalProofHash,
        auditIpfsHash,
        proposerAddress,
        auditorEmail,
        authorizationMessage
      );  
    } else {
      await claimsRegistry.submitClaimRejection(
        projectId,
        claimHash,
        proposalProofHash,
        auditIpfsHash,
        proposerAddress,
        auditorEmail,
        authorizationMessage
      );
    } 
  };

const proposeAndAuditClaim = async (
  claimsRegistry,
  projectId,
  proposerSigner,
  auditorSigner,
  {
    claim = 'this is a claim',
    proof = 'this is the proof',
    auditIpfsHash = 'audit_ipfs_hash',
    activityId = 42,
    proposerEmail = "proposer@email.com",
    auditorEmail = "auditor@email.com",
    approved = true
  },
) => {
  const proposerAddress = await proposerSigner.getAddress();

  const proposedClaim = {claim: claim, proof: proof, activityId: activityId, proposerEmail: proposerEmail};
  const { claimHash, proofHash } = await proposeClaim(claimsRegistry, projectId, proposerSigner, proposedClaim);
  await submitClaimAuditResult(claimsRegistry, projectId, claimHash, proofHash, auditIpfsHash, proposerAddress, approved, auditorSigner, auditorEmail);

  return { claimHash, proofHash };
}

const getClaimAudit = async (
  claimsRegistry,
  projectId,
  _auditorAddress,
  claimHash
) => {
  const [
    proofHash, activityId, proposerAddress, proposerEmail,
    wasAudited, auditorAddress, auditorEmail, approved, auditIpfsHash
  ] = await claimsRegistry.getClaimAudit(projectId, _auditorAddress, claimHash)

  return {
    proofHash: proofHash,
    activityId: activityId,
    proposerAddress: proposerAddress,
    proposerEmail: proposerEmail,
    wasAudited: wasAudited,
    auditorAddress: auditorAddress,
    auditorEmail: auditorEmail,
    approved: approved,
    auditIpfsHash: auditIpfsHash
  }
}

const getClaimHashes = (claim, proof) => {
    const claimHash = utils.id(claim || 'this is a claim');
    const proofHash = utils.id(proof || 'this is the proof');
    return {
      claimHash,
      proofHash,
    }
}

module.exports = {
  claimRegistryErrors,
  proposeClaim,
  submitClaimAuditResult,
  proposeAndAuditClaim,
  getClaimAudit
}