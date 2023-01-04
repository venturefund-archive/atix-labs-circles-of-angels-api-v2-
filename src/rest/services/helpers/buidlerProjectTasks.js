const { Wallet, utils } = require('ethers');
const { task, types } = require('@nomiclabs/buidler/config');
const { getSigner, signParameters } = require('./buidlerTaskHelpers');

const getProjectRegistryContract = async env =>
  env.deployments.getLastDeployedContract('ProjectsRegistry');

task('create-project', 'Create Project')
  .addOptionalParam('id', 'Project id', 1, types.int)
  .addOptionalParam('ipfsHash', 'Project IPFS hash', 'ipfsagreementhash')
  .setAction(async ({ id, ipfsHash }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    await projectRegistry.createProject(id || 1, ipfsHash);
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
      ["uint256", "string", "string"],
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
  .addOptionalParam('ipfsHash', 'Proposal IPFS hash', 'ipfsagreementhash')
  .addOptionalParam('proposerAddress', 'Proposer address', 'proposer@email.com')
  .addOptionalParam('isApproved', 'Audit result', true, types.boolean)
  .setAction(async ({ id, ipfsHash, proposerAddress, isApproved }, env) => {
    const projectRegistry = await getProjectRegistryContract(env);
    if (projectRegistry === undefined) {
      console.error('ProjectRegistry contract not deployed');
      return;
    }

    await projectRegistry.submitProjectEditAuditResult(
      id,
      ipfsHash,
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
        `Project ${id} has description: ${JSON.stringify(Object.entries(description).slice(4))}`
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

task('create-member', 'Create COA member')
  .addOptionalParam('profile', 'New member profile')
  .setAction(async ({ profile }, env) => {
    const coa = await getProjectRegistryContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
    const wallet = Wallet.createRandom();
    const { address } = wallet;
    const memberProfile = profile || 'Member created by buidler';
    const accounts = await env.ethers.getSigners();
    const tx = {
      to: address,
      value: utils.parseEther('0.003')
    };
    await accounts[0].sendTransaction(tx);
    const walletWithProvider = wallet.connect(env.ethers.provider);
    const coaWithSigner = await coa.connect(walletWithProvider);
    await coaWithSigner.createMember(memberProfile);
    console.log('New member address:', address);
    return address;
  });

task('migrate-members', 'Migrate existing users to current contract').setAction(
  async (_args, env) => {
    const owner = await getSigner(env);
    const coa = await getProjectRegistryContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
  
    // this array can be used to migrate the members
    const users = [];
  
    await Promise.all(
      users.map(async ({ profile, address }) => {
        await coa.migrateMember(profile, address);
        const tx = {
          to: address,
          value: utils.parseEther('0.001')
        };
        await owner.sendTransaction(tx);
        console.log(`${profile} - ${address} successfully migrated.`);
      })
    );
    console.log(`Finished migration for ${users.length} users.`);
  }
);
  
task('migrate-member', 'Migrate existing user to current contract')
  .addParam('profile', 'Member profile')
  .addParam('address', 'Member address')
  .addOptionalParam('notransfer', 'Transfer 0.001 eth', false, types.boolean)
  .addOptionalParam('onlytransfer', 'Transfer 0.001 eth', false, types.boolean)
  .setAction(async ({ profile, address, notransfer, onlytransfer }, env) => {
    const owner = await getSigner(env);
    const coa = await getProjectRegistryContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
    if (!onlytransfer) {
      await coa.migrateMember(profile, address);
      console.log(`${profile} - ${address} successfully migrated.`);
    }
    if (!notransfer) {
      const value = utils.parseEther('0.001');
      const tx = {
        to: address,
        value
      };
      await owner.sendTransaction(tx);
      console.log(`Transferred ${value} Wei to ${address}`);
    }
  });