const { readArtifact } = require('@nomiclabs/buidler/plugins');
const { ContractFactory, Wallet, utils } = require('ethers');
const { task, types } = require('@nomiclabs/buidler/config');
const config = require('config');

const { sha3 } = require('../../util/hash');
const { proposalTypeEnum, voteEnum } = require('../../util/constants');

const testSetup = require('../../../../scripts/jestGlobalSetup');
const testTeardown = require('../../../../scripts/jestGlobalTearDown');

const balanceService = require('../balancesService');
const Logger = require('../../logger');

async function getDeploymentSigner(env) {
  const { provider } = env.ethers;
  const accounts = await provider.listAccounts();

  return provider.getSigner(accounts[0]);
}

const getCOAContract = async env =>
  env.deployments.getLastDeployedContract('COA');

const getSigner = async (env, account) => env.deployments.getSigner(account);

const getDAOContract = async (env, address, signer) => {
  const { abi, bytecode } = await readArtifact(
    env.config.paths.artifacts,
    'DAO'
  );
  const factory = new ContractFactory(abi, bytecode, signer);
  return factory.attach(address);
};

const getRegistryContract = async env =>
  env.deployments.getLastDeployedContract('ClaimsRegistry');

task('test-contracts', 'Runs setup, tests and teardown').setAction(async () => {
  await global.run('test-contracts:testSetup');
  await global.run('test');
  await global.run('test-contracts:testTeardown');
});

task('test-contracts:testSetup', 'Runs the test setup').setAction(async () => {
  await testSetup();
});

task('test-contracts:testTeardown', 'Runs the test teardown').setAction(
  async () => {
    await testTeardown();
  }
);

async function disableGSNAndDo(doFunction) {
  const oldGSNIsEnabled = config.gsnConfig.isEnabled;
  config.gsnConfig.isEnabled = false;
  await doFunction();
  config.gsnConfig.isEnabled = oldGSNIsEnabled;
}

async function prepareDeployDoAndCheckBalances(
  env,
  resetStates,
  resetAllContracts,
  doFunction
) {
  if (resetStates || resetAllContracts) env.coa.clearContracts();
  const signer = await getDeploymentSigner(env);

  await disableGSNAndDo(async () => doFunction(signer));
  if (config.gsnConfig.isEnabled) await global.run('check-balances');
}

async function deployV0(env, resetStates, resetAllContracts) {
  await prepareDeployDoAndCheckBalances(
    env,
    resetStates,
    resetAllContracts,
    async signer =>
      env.deployments.deployV0(signer, resetStates, resetAllContracts)
  );
}

async function upgradeToV1(env, resetStates, resetAllContracts) {
  await prepareDeployDoAndCheckBalances(
    env,
    resetStates,
    resetAllContracts,
    async signer =>
      env.deployments.upgradeToV1(signer, resetStates, resetAllContracts)
  );
}

async function deployAll(env, resetStates, resetAllContracts) {
  await prepareDeployDoAndCheckBalances(
    env,
    resetStates,
    resetAllContracts,
    async signer =>
      env.deployments.deployAll(signer, resetStates, resetAllContracts)
  );
}

task('deploy_v0', 'Deploys COA v0 contracts')
  .addOptionalParam(
    'resetStates',
    'redeploy all proxies in order to reset all contract states',
    false,
    types.boolean
  )
  .addOptionalParam(
    'resetAllContracts',
    'force deploy of all contracts',
    false,
    types.boolean
  )
  .setAction(async ({ resetStates, resetAllContracts }, env) => {
    await deployV0(env, resetStates, resetAllContracts);
  });

task('deploy', 'Deploys COA contracts')
  .addOptionalParam(
    'resetStates',
    'redeploy all proxies in order to reset all contract states',
    false,
    types.boolean
  )
  .addOptionalParam(
    'resetAllContracts',
    'force deploy of all contracts',
    false,
    types.boolean
  )
  .setAction(async ({ resetStates, resetAllContracts }, env) => {
    await deployAll(env, resetStates, resetAllContracts);
  });

task(
  'upgradeContractsToV1',
  'Deploys and Upgrades to v1 upgradeable COA contracts'
)
  .addOptionalParam(
    'resetStates',
    'redeploy all proxies in order to reset all contract states',
    false,
    types.boolean
  )
  .addOptionalParam(
    'resetAllContracts',
    'force deploy of all contracts',
    false,
    types.boolean
  )
  .setAction(async ({ resetStates, resetAllContracts }, env) => {
    await upgradeToV1(env, resetStates, resetAllContracts);
  });

task('get-signer-zero', 'Gets signer zero address').setAction(
  async (_args, env) => {
    const signer = await getSigner(env);
    console.log('Signer:', signer._address);
    return signer._address;
  }
);

task('create-member', 'Create COA member')
  .addOptionalParam('profile', 'New member profile')
  .setAction(async ({ profile }, env) => {
    const coa = await getCOAContract(env);
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

task('create-dao', 'Create DAO')
  .addOptionalParam('account', 'DAO creator address')
  .setAction(async ({ account }, env) => {
    const coa = await getCOAContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }
    const creator = await getSigner(env, account);
    await coa.createDAO('DAO created by buidler task', creator._address);
    const daoIndex = (await coa.getDaosLength()) - 1;
    const daoAddress = await coa.daos(daoIndex);
    console.log(`New DAO Address: ${daoAddress} index: ${daoIndex}`);
    return daoAddress;
  });

task('create-project', 'Create Project')
  .addOptionalParam('id', 'Project id')
  .addOptionalParam('name', 'Project name')
  .addOptionalParam('agreement', 'Project agreement hash')
  .setAction(async ({ id, name, agreement }, env) => {
    const coa = await getCOAContract(env);
    if (coa === undefined) {
      console.error('COA contract not deployed');
      return;
    }

    await coa.createProject(
      id || 1,
      name || 'Buidler Project',
      agreement || 'ipfsagreementhash'
    );
    const projectIndex = (await coa.getProjectsLength()) - 1;
    const projectAddress = await coa.projects(projectIndex);
    console.log(
      `New project address: ${projectAddress} index: ${projectIndex}`
    );
    return projectAddress;
  });

task('add-claim', 'Add claim')
  .addParam('project', 'Project address')
  .addParam('milestone', 'Milestone id')
  .addOptionalParam('claim', 'Claim hash')
  .addOptionalParam('proof', 'Claim proof hash')
  .addOptionalParam('valid', 'Claim validity', true, types.boolean)
  .setAction(async ({ project, claim, proof, valid, milestone }, env) => {
    const registry = await getRegistryContract(env);
    if (registry === undefined) {
      console.error('ClaimRegistry contract not deployed');
      return;
    }

    await registry.addClaim(
      project,
      claim || sha3(1, 1, 1),
      proof || sha3('ipfsproofhash'),
      valid,
      milestone
    );

    return getSigner(env);
  });

task('propose-member-to-dao', 'Creates proposal to add member to existing DAO')
  .addParam('daoaddress', 'DAO address')
  .addParam('applicant', 'Applicant address')
  .addOptionalParam('proposer', 'Proposer address')
  .setAction(async ({ daoaddress, applicant, proposer }, env) => {
    const signer = await getSigner(env, proposer);
    const dao = await getDAOContract(env, daoaddress, signer);

    await dao.submitProposal(
      applicant,
      proposalTypeEnum.NEW_MEMBER,
      'Member added by buidler task'
    );
    const proposalIndex = (await dao.getProposalQueueLength()) - 1;
    console.log('New Proposal Index: ', proposalIndex);
    return proposalIndex;
  });

task('vote-proposal', 'Votes a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index', 0, types.int)
  .addParam('vote', 'Vote (true or false)', false, types.boolean)
  .addOptionalParam('voter', 'Voter address')
  .setAction(async ({ daoaddress, proposal, vote, voter }, env) => {
    const signer = await getSigner(env, voter);
    const dao = await getDAOContract(env, daoaddress, signer);
    let voted = voteEnum.NO;
    if (vote) voted = voteEnum.YES;
    await dao.submitVote(proposal, voted);
  });

task('process-proposal', 'Process a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index', 0, types.int)
  .addOptionalParam('signer', 'Tx signer address')
  .setAction(async ({ daoaddress, proposal, signer }, env) => {
    const member = await getSigner(env, signer);
    const dao = await getDAOContract(env, daoaddress, member);
    await dao.processProposal(proposal);
  });

task('migrate-members', 'Migrate existing users to current contract').setAction(
  async (_args, env) => {
    const owner = await getSigner(env);
    const coa = await getCOAContract(env);
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
    const coa = await getCOAContract(env);
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

task(
  'check-balances',
  'Checks the balance of all recipients contracts in COA'
).setAction(async (_args, env) => {
  try {
    const allContracts = await env.coa.getAllRecipientContracts();
    const signer = await env.coa.getSigner();
    await balanceService.checkContractBalances(allContracts, signer, env.web3);
  } catch (e) {
    Logger.error(e);
  }
});

task('run-dev-gsn').setAction(async () => {
  await global.run('test-contracts:testSetup');
});

task('stop-dev-gsn').setAction(async () => {
  await global.run('test-contracts:testTeardown');
});

task('encrypt-wallet')
  .addParam('pk')
  .addParam('password')
  .setAction(async ({ pk, password }, env) => {
    const wallet = new Wallet(pk, env.ethers.provider);
    const encryptedJson = JSON.stringify(await wallet.encrypt(password));
    console.log(encryptedJson);
    return encryptedJson;
  });
