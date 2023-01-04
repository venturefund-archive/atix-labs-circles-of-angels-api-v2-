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
    activityId = 42,
    proposerEmail = "proposer@email.com"
  } = {},
  senderSigner = null
) => {
  const { claimHash, proofHash } = getClaimHashes(claim, proof);

  // Obtain the authorization message
  const authorizationMessage = await signParameters(
      ['uint256', 'bytes32', 'bytes32', 'uint256', 'string'],
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
    proofHash,
    proposerAddress,
    approved,
    auditorSigner,
    auditorEmail = "auditor@email.com",
  ) => {
    // Obtain the authorization message
    const authorizationMessage = await signParameters(
        ['uint256', 'bytes32', 'bytes32', 'address', 'string', 'bool'],
        [projectId, claimHash, proofHash, proposerAddress, auditorEmail, approved],
        auditorSigner
    )

    await claimsRegistry.submitClaimAuditResult(
      projectId,
      claimHash,
      proofHash,
      proposerAddress,
      auditorEmail,
      approved,
      authorizationMessage
    );
  };

const proposeAndAuditClaim = async (
  claimsRegistry,
  projectId,
  proposerSigner,
  auditorSigner,
  {
    claim = 'this is a claim',
    proof = 'this is the proof',
    activityId = 42,
    proposerEmail = "proposer@email.com",
    auditorEmail = "auditor@email.com",
    approved = true
  },
) => {
  const proposerAddress = await proposerSigner.getAddress();

  const proposedClaim = {claim: claim, proof: proof, activityId: activityId, proposerEmail: proposerEmail};
  const { claimHash, proofHash } = await proposeClaim(claimsRegistry, projectId, proposerSigner, proposedClaim);
  await submitClaimAuditResult(claimsRegistry, projectId, claimHash, proofHash, proposerAddress, approved, auditorSigner, auditorEmail);

  return { claimHash, proofHash };
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
  proposeAndAuditClaim
}