const { Wallet } = require('ethers');
const { task, types } = require('@nomiclabs/buidler/config');
const config = require('config');

const testSetup = require('../../../../scripts/jestGlobalSetup');
const testTeardown = require('../../../../scripts/jestGlobalTearDown');

const balanceService = require('../balancesService');
const { getSigner } = require('./buidlerTaskHelpers');
const Logger = require('../../logger');

async function getDeploymentSigner(env) {
  const { provider } = env.ethers;
  const accounts = await provider.listAccounts();

  return provider.getSigner(accounts[0]);
}

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
