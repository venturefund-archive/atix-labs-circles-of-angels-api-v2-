const { describe, it, beforeAll, beforeEach, expect } = global;
const { artifacts } = require('hardhat');
const { gsnConfig } = require('config');
const {
  getOrDeployContract,
  getOrDeployUpgradeableContract,
  buildGetOrDeployUpgradeableContract,
  getSigner,
  getContractFactory
} = require('../../plugins/deployments');

describe('Deployments tests', () => {
  let creator;
  const oldGsnConfigIsEnabled = gsnConfig.isEnabled;

  beforeAll(async () => {
    gsnConfig.isEnabled = false;
    creator = await getSigner(0);
  });

  afterAll(() => {
    gsnConfig.isEnabled = oldGsnConfigIsEnabled;
  });

  const validContractName = 'ClaimsRegistry';
  const invalidContractName = 'NotContractName';

  describe('Static functions', () => {
    describe('with a contract deployed', () => {
      let contract1;

      beforeAll(async () => {
        contract1 = await getOrDeployContract(
          validContractName,
          [],
          creator,
          true
        );
      });

      it("getOrDeployContract should deploy if the contract doesn't exists", async () => {
        expect(contract1).toBeDefined();
      });

      it('getOrDeployContract should return the deployed contract if the contract was already deployed', async () => {
        const contract2 = await getOrDeployContract(
          validContractName,
          [],
          creator,
          false
        );
        expect(contract1.address).toEqual(contract2.address);
      });

      it('getOrDeployContract should throw an error if the contractName is invalid', () => {
        expect(
          getOrDeployContract(invalidContractName, [], false)
        ).rejects.toThrow();
      });
    });

    describe('with an upgradeable contract deployed', () => {
      let contract1;

      beforeEach(async () => {
        contract1 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator,
          { initializer: 'registryInitialize' },
          true
        );
      });

      it("getOrDeployUpgradeableContract should deploy if the contract doesn't exists", async () => {
        expect(contract1).toBeDefined();
      });

      it('getOrDeployUpgradeableContract should return the deployed contract if the contract was already deployed', async () => {
        const contract2 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator
        );
        expect(contract1.address).toEqual(contract2.address);
      });

      it('getOrDeployUpgradeableContract should throw an error if the contractName is invalid', () => {
        expect(
          getOrDeployUpgradeableContract(
            invalidContractName,
            [],
            creator,
            undefined,
            true
          )
        ).rejects.toThrow();
      });

      it('getOrDeployUpgradeableContract should throw an error if there is a new implementation', async () => {
        // Mocking readArtifactSync
        const mockedClaimsRegistryArtifactFun = (_) =>
          artifacts.readArtifactSync('ClaimsRegistryV1ForTests');

        // Mocking getContractFactory
        const mockedClaimsRegistryFactFun = () =>
          getContractFactory('ClaimsRegistryV1ForTests', creator);

        expect(
          buildGetOrDeployUpgradeableContract(
            mockedClaimsRegistryArtifactFun,
            mockedClaimsRegistryFactFun
          )(validContractName, [], creator)
        ).rejects.toThrow();
      });
    });
  });
});
