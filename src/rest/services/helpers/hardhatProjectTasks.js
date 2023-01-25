const { task, types } = require('hardhat/config');
const { getSigner, signParameters } = require('./hardhatTaskHelpers');

const getProjectRegistryContract = async env =>
  env.deployments.getLastDeployedContract('ProjectsRegistry');

task('create-project', 'Create Project')
  .addOptionalParam('id', 'Project id', 1, types.string)
  .addOptionalParam('ipfsHash', 'Project IPFS hash', 'ipfsagreementhash')
  .setAction(async ({ id, ipfsHash }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    await projectRegistry.createProject(id || '44', ipfsHash);
    console.log(
      `New project created with: ${id} and ipfs hash: ${ipfsHash}`
    );
  });

task('propose-project-edit', 'Propose an edit to a project')
  .addParam('id', 'Project id')
  .addOptionalParam('ipfsHash', 'Proposed new IPFS hash', 'ipfsagreementhash')
  .addOptionalParam('proposerEmail', 'Proposer email', 'proposer@email.com')
  .setAction(async ({ id, ipfsHash, proposerEmail }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    const authorizationSignature = await signParameters(
      ["string", "string", "string"],
      [id, ipfsHash, proposerEmail],
      await getSigner(env)
    );

    await projectRegistry.proposeProjectEdit(
      id,
      ipfsHash,
      proposerEmail,
      authorizationSignature
    );
    console.log(
      `New project edit created with: ${id} and ipfs hash: ${ipfsHash}`
    );
  });

task('audit-project-edit-proposal', 'Audit a project edit proposal')
  .addParam('id', 'Project id')
  .addOptionalParam('proposalIpfsHash', 'Proposed new IPFS hash', 'ipfsagreementhash')
  .addOptionalParam('auditIpfsHash', 'Proposed new IPFS hash', 'ipfsagreementhash')
  .addOptionalParam('proposerAddress', 'Proposer address', 'proposer@email.com')
  .addOptionalParam('isApproved', 'Audit result', true, types.boolean)
  .setAction(async ({ id, proposalIpfsHash, auditIpfsHash, proposerAddress, isApproved }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    await projectRegistry.submitProjectEditAuditResult(
      id,
      proposalIpfsHash,
      auditIpfsHash,
      proposerAddress,
      isApproved
    );
    console.log(
      `Project ${id} edit audited created with result ${isApproved}`
    );
  });

task('get-project-description', 'Get project description')
  .addParam('id', 'Project id')
  .setAction(async ({ id }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    const description = await projectRegistry.projectsDescription(id);
    if (description.isCreated) {
      console.log(
        `Project ${id} has description: ${JSON.stringify(Object.entries(description).slice(5))}`
      );
    } else {
      console.log(`Queried project ${id} doesn't exist`);
    }
  });

task('get-project-proposed-edit', 'Get project description')
  .addParam('id', 'Project id')
  .addParam('proposerAddress', 'Address of the proposal creator')
  .setAction(async ({ id, proposerAddress }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    const proposalDescription = await projectRegistry.pendingEdits(id, proposerAddress);
    if (proposalDescription.isCreated) {
      console.log(
        `Project ${id} has proposal with description: ${JSON.stringify(proposalDescription)}`
      );
    } else {
      console.log(`Queried project proposal ${id} from ${proposerAddress} doesn't exist`);
    }
  });
