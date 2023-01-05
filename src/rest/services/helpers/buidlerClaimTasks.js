const { Wallet, utils } = require('ethers');
const { task, types } = require('@nomiclabs/buidler/config');
const { getSigner, signParameters } = require('./buidlerTaskHelpers');

const getClaimRegistryContract = async env =>
  env.deployments.getLastDeployedContract('ClaimsRegistry');

function mappingToJSON(mapping, startingIndex = 0) {
  if (!!mapping) {
    return JSON.stringify(Object.entries(mapping).slice(startingIndex));
  } else {
    return "[]";
  }
}

const getClaimAudit = async (
  claimsRegistry,
  projectId,
  _auditorAddress,
  claimHash
) => {
  const [
    proofHash, activityId, proposerAddress, proposerEmail,
    wasAudited, auditorAddress, auditorEmail, approved
  ] = await claimsRegistry.getClaimAudit(projectId, _auditorAddress, claimHash)

  return {
    proofHash: proofHash,
    activityId: activityId,
    proposerAddress: proposerAddress,
    proposerEmail: proposerEmail,
    wasAudited: wasAudited,
    auditorAddress: auditorAddress,
    auditorEmail: auditorEmail,
    approved: approved
  }
}

task('propose-claim', 'Propose an edit to a project')
  .addParam('id', 'Project id')
  .addOptionalParam('claimHash', 'The hash of the claim', '0x0000000000000000000000000000000000000000000000000000000000001234')
  .addOptionalParam('proofHash', 'The hash of the proof', '0x0000000000000000000000000000000000000000000000000000000000001111')
  .addOptionalParam('activityId', 'The id of the activity the claim belongs to', 10, types.int)
  .addOptionalParam('proposerEmail', 'The email of the proposer', "proposer@email.com")
  .setAction(async ({ id, claimHash, proofHash, activityId, proposerEmail }, env) => {
    const claimRegistry = await getClaimRegistryContract(env);
    if (claimRegistry === undefined) {
      console.error('ClaimRegistry contract not deployed');
      return;
    }

    const authorizationSignature = await signParameters(
      ['uint256', 'bytes32', 'bytes32', 'uint256', 'string'],
      [id, claimHash, proofHash, activityId, proposerEmail],
      await getSigner(env)
    );

    await claimRegistry.proposeClaim(
      id,
      claimHash,
      proofHash,
      activityId,
      proposerEmail,
      authorizationSignature
    );
    console.log(
      `New claim created with: ${id}, claim hash: ${claimHash} and proof hash ${proofHash}`
    );
  });

task('audit-claim', 'Audit a project edit proposal')
  .addParam('id', 'Project id')
  .addOptionalParam('claimHash', 'The hash of the claim', '0x0000000000000000000000000000000000000000000000000000000000001234')
  .addOptionalParam('proofHash', 'The hash of the proof', '0x0000000000000000000000000000000000000000000000000000000000001111')
  .addParam('proposerAddress', 'The address of the proposer')
  .addOptionalParam('auditorEmail', 'The email of the auditor', "proposer@email.com")
  .addOptionalParam('isApproved', 'The audit result', true, types.boolean)
  .setAction(async ({ id, claimHash, proofHash, proposerAddress, auditorEmail, isApproved }, env) => {
    const claimRegistry = await getClaimRegistryContract(env);
    if (claimRegistry === undefined) {
      console.error('ClaimRegistry contract not deployed');
      return;
    }

    const authorizationSignature = await signParameters(
      ['uint256', 'bytes32', 'bytes32', 'address', 'string', 'bool'],
      [id, claimHash, proofHash, proposerAddress, auditorEmail, isApproved],
      await getSigner(env)
    );

    await claimRegistry.submitClaimAuditResult(
      id,
      claimHash,
      proofHash,
      proposerAddress,
      auditorEmail,
      isApproved,
      authorizationSignature
    );
    console.log(
      `Audited (with result ${isApproved}) claim of project ${id}, claim hash: ${claimHash} proof hash ${proofHash} and author ${proposerAddress}`
    );
});

task('get-claim', 'Get project description')
  .addParam('id', 'Project id')
  .addOptionalParam('proposerAddress', 'Proposer of the claim')
  .addOptionalParam('auditorAddress', 'Auditor of the proposal of the claim')
  .addOptionalParam('claimHash', 'The hash of the claim', '0x0000000000000000000000000000000000000000000000000000000000001234')
  .setAction(async ({ id, proposerAddress, auditorAddress, claimHash }, env) => {
    const claimRegistry = await getClaimRegistryContract(env);
    if (claimRegistry === undefined) {
      console.error('ClaimRegistry contract not deployed');
      return;
    }

    if (!!auditorAddress) {
        const audit = await getClaimAudit(claimRegistry, id, auditorAddress, claimHash);
        if (audit.wasAudited) {
          console.log(
            `Claim ${claimHash} from project ${id} has audit:
              ${mappingToJSON(audit, 0)}`
          )
          return;
        }
    }

    if(!!proposerAddress) {
      const proposal = await claimRegistry.registryProposedClaims(id, proposerAddress, claimHash);
      if (proposal.exists) {
        console.log(
          `Claim ${claimHash} from project ${id} has proposal (with no audit):
            ${mappingToJSON(proposal, 5)}`
        );
      }
    }
  });
