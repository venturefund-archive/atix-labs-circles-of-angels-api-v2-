const { utils } = require('ethers');

const abiCoder = utils.defaultAbiCoder;

const relayClaim = async (
    claimsRegistry,
    projectAddress,
    signer,
    theClaim = {
      claim: 'this is a claim',
      proof: 'this is the proof',
      milestone: 'the milestone',
      approved: true
    }
  ) => {
    const { claimHash, proofHash, milestoneHash } = getClaimHashes(theClaim);
    const { approved } = theClaim;

    // Obtain the authorization message
    const authorizationMessage = await signParameters(
        ['address', 'bytes32', 'bytes32', 'bool', 'uint256'],
        [projectAddress, claimHash, proofHash, approved, milestoneHash],
        signer
    )

    await claimsRegistry.submitClaimAuditResult(
      projectAddress,
      claimHash,
      proofHash,
      theClaim.approved,
      milestoneHash,
      authorizationMessage
    );
    return {
      claimHash,
      proofHash,
      approved,
      milestoneHash
    };
  };

const signParameters = async (
  parameterTypes,
  parameterValues,
  signer
) => {
  const encodedParams = abiCoder.encode(
    parameterTypes,
    parameterValues
  )

  // Message hash is converted to bytes so that signMessage doesn't change it's encoding
  const messageHash = utils.arrayify(utils.keccak256(encodedParams));
  const signature = await signer.signMessage(messageHash);

  return signature;
}

const getClaimHashes = (theClaim) => {
    const { claim, proof, milestone } = theClaim;
    const claimHash = utils.id(claim || 'this is a claim');
    const proofHash = utils.id(proof || 'this is the proof');
    const milestoneHash = utils.id(milestone || 'this is the milestone');
    return {
        claimHash,
        proofHash,
        milestoneHash
    }
}

module.exports = {
    relayClaim
}