const { promises: fs } = require('fs');
const path = require('path');
const {
  resumeOrDeploy,
  waitAndValidateDeployment,
  isDevelopmentNetwork,
  Manifest,
  InvalidDeployment
} = require('@openzeppelin/upgrades-core');

/**
 * This file was imported from Openzeppelin in order to make some changes like be able to deploy
 *  an implementation alone.
 * @See the original version at '@openzeppelin/upgrades-core/src/impl-store.ts'
 */

async function fetchOrDeployGeneric(
  manifestLens,
  provider,
  deploy,
  reset = false
) {
  const manifest = await Manifest.forNetwork(provider);

  try {
    const deployment = await manifest.lockedRun(async () => {
      const data = await manifest.read();
      const manifestDeployment = manifestLens(data);
      const stored = manifestDeployment.get();
      const cache = reset ? undefined : stored;
      const updated = await resumeOrDeploy(provider, cache, deploy);
      if (updated !== stored) {
        await checkForAddressClash(provider, data, updated);
        manifestDeployment.set(updated);
        await manifest.write(data);
      }
      return updated;
    });

    await waitAndValidateDeployment(provider, deployment);

    return deployment.address;
  } catch (e) {
    // If we run into a deployment error, we remove it from the manifest.
    if (e instanceof InvalidDeployment) {
      await manifest.lockedRun(async () => {
        const data = await manifest.read();
        const deployment = manifestLens(data);
        const stored = deployment.get();
        if (stored && stored.txHash === e.deployment.txHash) {
          deployment.set(undefined);
          await manifest.write(data);
        }
      });
    }

    throw e;
  }
}

async function fetchOrDeploy(version, provider, deploy, reset = false) {
  return fetchOrDeployGeneric(
    implLens(version.linkedWithoutMetadata),
    provider,
    deploy,
    reset
  );
}

const adminLens = lens('proxy admin', data => ({
  get: () => data.admin,
  // eslint-disable-next-line no-return-assign,no-param-reassign
  set: value => (data.admin = value)
}));

const implLens = versionWithoutMetadata =>
  lens(`implementation ${versionWithoutMetadata}`, data => ({
    get: () => data.impls[versionWithoutMetadata],
    // eslint-disable-next-line no-param-reassign,no-return-assign
    set: value => (data.impls[versionWithoutMetadata] = value)
  }));

function lens(description, fn) {
  return Object.assign(fn, { description });
}

async function checkForAddressClash(provider, data, updated) {
  const clash = lookupDeployment(data, updated.address);
  if (clash !== undefined) {
    if (await isDevelopmentNetwork(provider)) {
      clash.set(undefined);
    } else {
      throw new Error(
        `The following deployment clashes with an existing one at ${
          updated.address
        }\n\n${JSON.stringify(updated, null, 2)}\n\n`
      );
    }
  }
}

function lookupDeployment(data, address) {
  if (data.admin && data.admin.address === address) {
    return adminLens(data);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const versionWithoutMetadata in data.impls) {
    // noinspection JSUnfilteredForInLoop
    if (
      data.impls[versionWithoutMetadata] &&
      data.impls[versionWithoutMetadata].address === address
    ) {
      // noinspection JSUnfilteredForInLoop
      return implLens(versionWithoutMetadata)(data);
    }
  }
}

async function readValidations(hardhatConfig) {
  try {
    return JSON.parse(
      await fs.readFile(getValidationCachePath(hardhatConfig), 'utf8')
    );
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(
        'Validations cache not found. Recompile with `hardhat compile --force`'
      );
    } else {
      throw e;
    }
  }
}

function getValidationCachePath(hardhatConfig) {
  return path.join(hardhatConfig.paths.cache, 'validations.json');
}

module.exports = {
  fetchOrDeploy,
  readValidations
};
