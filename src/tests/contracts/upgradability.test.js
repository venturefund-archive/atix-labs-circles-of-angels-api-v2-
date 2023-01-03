const { run, deployments, ethers, upgrades } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils, Wallet } = require('ethers');
const { testConfig } = require('config');
const { sha3 } = require('../../rest/util/hash');
const { relayClaim } = require('./helpers/registryHelpers')

const { before } = global;

// @title UPGRADABILITY TESTS for all the contracts
// There's a describe for each upgradable contract, each test inside the describe
// may be dependant of the previous one to prove the stored values in the contract
// remain the same and the storage got migrated

async function deployV0() {
  await run('deploy_v0', { resetAllContracts: true });
}

// FIXME: separate this file into upgrade to v1 and upgrade to v2 tests
// eslint-disable-next-line func-names, no-undef
contract(
  'Upgradability ==>> ',
  async ([
    creator,
    other,
    projectAddress,
    coaAddress,
    whitelistAddress,
    daoCreator
  ]) => {
    before(function b() {
      this.timeout(testConfig.contractTestTimeoutMilliseconds);
    });

    describe('Upgradability Contracts Tests (to V2)', () => {
      let claimsRegistryContract;
      let coaContract;
      let proxyAdminContract;
      let usersWhitelistContract;
      const projectData = {
        id: 1,
        ipfsHash: 'an_ipfs_hash'
      };
      // FIXME: A random address is used for now, as it's pending for this parameter to be the project id and not it's address
      const { address : projectAddress} = Wallet.createRandom();
      let auditorSigner;
      let auditorAddress;

      // eslint-disable-next-line func-names, no-undef
      before(async function() {
        await run('deploy', { resetStates: true });

        claimsRegistryContract = await deployments.getLastDeployedContract(
          'ClaimsRegistry'
        );

        coaContract = await deployments.getLastDeployedContract('COA');

        proxyAdminContract = await deployments.getLastDeployedContract(
          'ProxyAdmin'
        );

        usersWhitelistContract = await deployments.getLastDeployedContract(
          'UsersWhitelist'
        );

        await coaContract.createProject(projectData.id, projectData.ipfsHash);

        auditorSigner = (await ethers.getSigners())[1];
        auditorAddress = await auditorSigner.getAddress();
      });

      describe('[ClaimRegistry] contract should: ', () => {
        it('Store value on the Registry mapping', async () => {
          const { proofHash, claimHash } = await relayClaim(
            claimsRegistryContract,
            projectAddress,
            auditorSigner,
            {
              claim: 'this is a claim',
              proof: 'this is the proof',
              milestone: 'this is the milestone',
              approved: true
            }
          );
          const claim = await claimsRegistryContract.registry(
            projectAddress,
            auditorAddress,
            claimHash
          );
          assert.strictEqual(claim.proof, proofHash);
        });

        it('Get Upgraded, return the stored value and execute a new function of the upgraded contract', async () => {
          const claimHash = utils.id('this is a claim');
          const proofHash = utils.id('this is the proof');

          const mockContract = await ethers.getContractFactory(
            'ClaimsRegistryV2'
          );
          const claimsRegistryV2 = await upgrades.upgradeProxy(
            claimsRegistryContract.address,
            mockContract,
            { unsafeAllowCustomTypes: true }
          );
          const claim = await claimsRegistryV2.registry(
            projectAddress,
            auditorAddress,
            claimHash
          );
          assert.equal(claim.proof, proofHash);

          await claimsRegistryV2.setTest('test');
          assert.equal(await claimsRegistryV2.test(), 'test');
        });
      });

      describe('[UsersWhitelist] contract should', () => {
        it('Get project length before and after creating a project', async () => {
          await usersWhitelistContract.addUser(other, { from: creator });
          const retUser = await usersWhitelistContract.users(other);
          assert.equal(retUser, true);
        });

        it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
          const mockContract = await ethers.getContractFactory(
            'UsersWhitelistV2'
          );
          const usersWhitelistContractV2 = await upgrades.upgradeProxy(
            usersWhitelistContract.address,
            mockContract,
            {
              unsafeAllowCustomTypes: true
            }
          );

          const retUser = await usersWhitelistContractV2.users(other);
          assert.equal(retUser, true);

          await usersWhitelistContractV2.setTest('test');
          const retTest = await usersWhitelistContractV2.test();
          assert.equal(retTest, 'test');
        });
      });

      // Note: this test upgrades the coaContract v1 to v2, so it was located after the coaContract v1 is no longer used
      describe('[COA] contract should', () => {
        it('Get project length before and after creating a project', async () => {
          let retProjectLength = await coaContract.getProjectsLength();
          assert.equal(retProjectLength.toString(), '1');

          const newProjectData = {
            id: 2,
            name: 'New Project 2'
          };
          await coaContract.createProject(
            newProjectData.id,
            newProjectData.name
          );
          retProjectLength = await coaContract.getProjectsLength();
          assert.equal(retProjectLength.toString(), '2');
        });

        it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
          const mockContract = await ethers.getContractFactory('COAV2');
          const coaV2 = await upgrades.upgradeProxy(
            coaContract.address,
            mockContract,
            {
              unsafeAllowCustomTypes: true
            }
          );

          const retProjectLength = await coaV2.getProjectsLength();
          assert.equal(retProjectLength.toString(), '2');

          await coaV2.setTest('test');
          const retTest = await coaV2.test();
          assert.equal(retTest, 'test');
        });
      });
    });

    describe('Contract version upgrade tests (to V1)', () => {
      const registryV0Name = 'ClaimsRegistry_v0';
      const registryV1Name = 'ClaimsRegistry';
      const coaV0Name = 'COA_v0';
      const coaV1Name = 'COA';
      const daoV0Name = 'DAO_v0';
      const daoV1Name = 'DAO';
      const superDaoV0Name = 'SuperDAO_v0';
      const superDaoV1Name = 'SuperDAO';
      const projectV1Name = 'Project';

      describe('ClaimsRegistry contract', () => {
        let registryContract;
        let newRegistryContract;
        let registryV1Factory;
        let registryOptions;
        const claimUpgradeFunction = 'claimUpgradeToV1';

        const mockClaim = 'mock_claim';
        let mockClaimHash;
        const mockProof = 'mock_proof';
        const mockApproved = true;
        const mockMilestone = 'mock_milestone';
        let auditorSigner;
        let auditorAddress;

        // eslint-disable-next-line no-undef
        before(async function b() {
          await deployV0();
          registryContract = await deployments.getLastDeployedContract(
            registryV0Name
          );
          registryV1Factory = await deployments.getContractFactory(
            registryV1Name
          );
          registryOptions = {
            unsafeAllowCustomTypes: true,
            contractName: registryV1Name,
            upgradeContractFunction: claimUpgradeFunction,
            upgradeContractFunctionParams: [
              creator
            ]
          };

          auditorSigner = (await ethers.getSigners())[1];
          auditorAddress = await auditorSigner.getAddress();

          const { claimHash } = await relayClaim(
            registryContract,
            projectAddress,
            auditorSigner,
            {claim: mockClaim, proof: mockProof, approved: mockApproved, milestone: mockMilestone}
          );
          mockClaimHash = claimHash;

          newRegistryContract = await deployments.upgradeContract(
            registryContract.address,
            registryV1Factory,
            registryOptions
          );
        });

        it('should be able to upgrade from v0 to v1', async () => {
          assert.equal(newRegistryContract.address, registryContract.address);
        });

        it('upgrade should maintain storage', async () => {
          const claim = await newRegistryContract.registry(
            projectAddress,
            auditorAddress,
            mockClaimHash
          );
          assert.equal(claim.approved, mockApproved);
          assert.equal(claim.proof, utils.id(mockProof));
        });

        it('upgrade should set owner', async () => {
          const returnedOwnerAddress = await newRegistryContract.owner();
          assert.equal(
            returnedOwnerAddress.toLowerCase(),
            creator.toLowerCase()
          );
        });

        it('upgrade should allow still adding claims', async () => {
          const newApproved = false;
          await relayClaim(
            newRegistryContract,
            projectAddress,
            auditorSigner,
            {claim: mockClaim, proof: mockProof, approved: newApproved, milestone: mockMilestone}
          );
          const claim = await newRegistryContract.registry(
            projectAddress,
            auditorAddress,
            mockClaimHash
          );
          assert.equal(claim.approved, newApproved);
        });
      });

      describe('COA contract', () => {
        const coaUpgradeFunction = 'coaUpgradeToV1';

        let coaV0Contract;
        let newCoaContract;
        let coaV1Factory;
        let coaOptions;
        const projectData = {
          id: 1,
          ipfsHash: 'an_ipfs_hash'
        };

        // eslint-disable-next-line no-undef
        before(async function b() {
          await deployV0();
          coaV0Contract = await deployments.getLastDeployedContract(coaV0Name);
          await coaV0Contract.createProject(projectData.id, projectData.ipfsHash);
          coaV1Factory = await deployments.getContractFactory(coaV1Name);
          coaOptions = {
            unsafeAllowCustomTypes: true,
            contractName: coaV1Name,
            upgradeContractFunction: coaUpgradeFunction,
            upgradeContractFunctionParams: [
              creator
            ]
          };
          newCoaContract = await deployments.upgradeContract(
            coaV0Contract.address,
            coaV1Factory,
            coaOptions
          );
        });

        it('should be able to upgrade from v0 to v1', async () => {
          assert.equal(newCoaContract.address, coaV0Contract.address);
        });

        it('upgrade should maintain storage', async () => {
          const returnedProjectId = await newCoaContract.projectIds(0);
          assert.equal(returnedProjectId, projectData.id);
        });

        it('upgrade should allow still creating Projects', async () => {
          const newProjectIpfsHash = 'New Project';
          const newProjectId = 10;
          await newCoaContract.createProject(newProjectId, newProjectIpfsHash);
          const newProjectDescription = await newCoaContract.projectsDescription(newProjectId);
          assert.equal(newProjectDescription.ipfsHash, newProjectIpfsHash);
        });
      });
    });
  }
);
