const { run, deployments, ethers, upgrades } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');
const { testConfig, gsnConfig } = require('config');
const { sha3 } = require('../../rest/util/hash');

const { before } = global;

// @title UPGRADABILITY TESTS for all the contracts
// There's a describe for each upgradable contract, each test inside the describe
// may be dependant of the previous one to prove the stored values in the contract
// remain the same and the storage got migrated

async function deployV0() {
  await run('deploy_v0', { resetAllContracts: true });
}

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

    describe('Upgradability Contracts Tests', () => {
      let claimsRegistryContract;
      let coaContract;
      let proxyAdminContract;
      let usersWhitelistContract;
      const projectData = {
        id: 1,
        name: 'New Project'
      };
      let project1;

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

        await coaContract.createProject(projectData.id, projectData.name);
        project1 = await coaContract.projects(0);
      });

      describe('[ClaimRegistry] contract should: ', () => {
        it('Store value on the Registry mapping', async () => {
          const claimHash = utils.id('this is a claim');
          const proofHash = utils.id('this is the proof');
          const milestoneHash = utils.id('this is the milestone');
          await claimsRegistryContract.addClaim(
            project1,
            claimHash,
            proofHash,
            true,
            milestoneHash
          );
          const claim = await claimsRegistryContract.registry(
            project1,
            creator,
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
            project1,
            creator,
            claimHash
          );
          assert.equal(claim.proof, proofHash);

          await claimsRegistryV2.setTest('test');
          assert.equal(await claimsRegistryV2.test(), 'test');
        });
      });

      describe('[Project] contract should', () => {
        it('Store value of the name when deployed', async () => {
          const projectInstance = await deployments.getContractInstance(
            'Project',
            project1,
            other
          );
          const retName = await projectInstance.name();
          assert.equal(retName, projectData.name);
        });

        it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
          const factory = await ethers.getContractFactory('ProjectV2');
          const mockContract = await factory.deploy({});
          const proxyInstance = await deployments.getContractInstance(
            'AdminUpgradeabilityProxy',
            project1,
            creator
          );

          await proxyAdminContract.upgrade(
            proxyInstance.address,
            mockContract.address
          );

          const projectV2 = await deployments.getContractInstance(
            'ProjectV2',
            project1,
            other
          );
          const retName = await projectV2.name();
          assert.equal(retName, projectData.name);

          await projectV2.setTest('test');
          const retTest = await projectV2.test();
          assert.equal(retTest, 'test');
        });
      });

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

      describe('[Super DAO] and [DAO] contract should: ', () => {
        let superDao;
        let dao1;
        const superDaoName = 'Super DAO';
        const newDaoData = {
          name: 'New Dao',
          daoCreator: other
        };
        // eslint-disable-next-line func-names, no-undef
        before(async function() {
          superDao = await coaContract.daos(0);
          await coaContract.createDAO(newDaoData.name, newDaoData.daoCreator);
          dao1 = await coaContract.daos(1);
        });

        it('[SuperDAO] retrieve stored value as Super DAO', async () => {
          const superDaoInstance = await deployments.getContractInstance(
            'SuperDAO',
            superDao,
            creator
          );

          const retNameSuper = await superDaoInstance.name();

          assert.equal(retNameSuper, superDaoName);
        });

        it('[SuperDAO] Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
          const factory = await ethers.getContractFactory('SuperDAOV2');
          const mockContract = await factory.deploy({});
          const proxyInstance = await deployments.getContractInstance(
            'AdminUpgradeabilityProxy',
            superDao,
            creator
          );

          await proxyAdminContract.upgrade(
            proxyInstance.address,
            mockContract.address
          );

          const superDAOV2 = await deployments.getContractInstance(
            'SuperDAOV2',
            superDao,
            other
          );

          const retName = await superDAOV2.name();
          assert.equal(retName, superDaoName);

          await superDAOV2.setTest('test');
          const retTest = await superDAOV2.test();
          assert.equal(retTest, 'test');
        });

        it('[DAO] retrieve stored value as New DAO', async () => {
          const daoInstance = await deployments.getContractInstance(
            'DAO',
            dao1,
            creator
          );

          const retNameDao = await daoInstance.name();
          assert.equal(retNameDao, newDaoData.name);
        });

        it('[DAO] Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
          const factory = await ethers.getContractFactory('DAOV2');
          const mockContract = await factory.deploy({});
          const proxyInstance = await deployments.getContractInstance(
            'AdminUpgradeabilityProxy',
            dao1,
            creator
          );

          await proxyAdminContract.upgrade(
            proxyInstance.address,
            mockContract.address
          );

          const daoV2 = await deployments.getContractInstance(
            'DAOV2',
            dao1,
            other
          );

          const retName = await daoV2.name();
          assert.equal(retName, newDaoData.name);

          await daoV2.setTest('test');
          const retTest = await daoV2.test();
          assert.equal(retTest, 'test');
        });
      });
    });

    describe('Contract version upgrade tests', () => {
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

        const mockClaim = sha3('mock_claim');
        const mockProof = sha3('mock_proof');
        const mockApproved = true;
        const mockMilestone = 5000;

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
              whitelistAddress,
              creator,
              gsnConfig.relayHubAddress
            ]
          };
          await registryContract.addClaim(
            projectAddress,
            mockClaim,
            mockProof,
            mockApproved,
            mockMilestone
          );
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
            creator,
            mockClaim
          );
          assert.equal(claim.approved, mockApproved);
          assert.equal(claim.proof, mockProof);
        });

        it('upgrade should set relayHubAddress', async () => {
          const relayHubAddress = await newRegistryContract.getHubAddr();
          assert.equal(
            relayHubAddress.toLowerCase(),
            gsnConfig.relayHubAddress.toLowerCase()
          );
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
          await newRegistryContract.addClaim(
            projectAddress,
            mockClaim,
            mockProof,
            newApproved,
            mockMilestone
          );
          const claim = await newRegistryContract.registry(
            projectAddress,
            creator,
            mockClaim
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
        let superDaoAddress;

        const newDaoPeriodConfig = {
          periodDuration: 10,
          votingPeriodLength: 20,
          gracePeriodLength: 30
        };
        // eslint-disable-next-line no-undef
        before(async function b() {
          await deployV0();
          const implDao = await deployments.getOrDeployContract(
            daoV1Name,
            [],
            await deployments.getSigner(creator),
            true
          );
          coaV0Contract = await deployments.getLastDeployedContract(coaV0Name);
          superDaoAddress = await coaV0Contract.daos(0);
          coaV1Factory = await deployments.getContractFactory(coaV1Name);
          coaOptions = {
            unsafeAllowCustomTypes: true,
            contractName: coaV1Name,
            upgradeContractFunction: coaUpgradeFunction,
            upgradeContractFunctionParams: [
              whitelistAddress,
              gsnConfig.relayHubAddress,
              implDao.address,
              ...Object.values(newDaoPeriodConfig)
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
          const returnedSuperDaoAddress = await newCoaContract.daos(0);
          assert.equal(returnedSuperDaoAddress, superDaoAddress);
        });

        it('upgrade should set whiteList address', async () => {
          const returnedWhiteListAddress = await newCoaContract.whitelist();
          assert.equal(
            returnedWhiteListAddress.toLowerCase(),
            whitelistAddress.toLowerCase()
          );
        });

        it('upgrade should allow still creating DAOs with new period config', async () => {
          const newDaoName = 'New DAO';
          await newCoaContract.createDAO(newDaoName, daoCreator);
          const newDaoAddress = await newCoaContract.daos(1);
          const daoFactory = await deployments.getContractFactory(daoV1Name);
          const newDao = await daoFactory.attach(newDaoAddress);
          const returnedDaoName = await newDao.name();
          const returnedDaoPeriodDuration = await newDao.periodDuration();
          const returnedDaoVotingPeriodLength = await newDao.votingPeriodLength();
          const returnedDaoGracePeriodLength = await newDao.gracePeriodLength();
          const returnedDaoProcessingPeriodLength = await newDao.processingPeriodLength();
          assert.equal(returnedDaoName, newDaoName);
          assert.equal(
            returnedDaoPeriodDuration,
            newDaoPeriodConfig.periodDuration
          );
          assert.equal(
            returnedDaoVotingPeriodLength,
            newDaoPeriodConfig.votingPeriodLength
          );
          assert.equal(
            returnedDaoGracePeriodLength,
            newDaoPeriodConfig.gracePeriodLength
          );
          assert.equal(
            returnedDaoProcessingPeriodLength,
            newDaoPeriodConfig.votingPeriodLength +
              newDaoPeriodConfig.gracePeriodLength
          );
        });

        it('upgrade should allow still creating Projects', async () => {
          const newProjectName = 'New Project';
          const newProjectId = 10;
          await newCoaContract.createProject(newProjectId, newProjectName);
          const newProjectAddress = await newCoaContract.projects(0);
          const projectFactory = await deployments.getContractFactory(
            projectV1Name
          );
          const newProject = await projectFactory.attach(newProjectAddress);
          const returnedProjectName = await newProject.name();
          assert.equal(returnedProjectName, newProjectName);
        });
      });

      describe('SuperDAO contract', () => {
        const superDaoUpgradeFunction = 'superDaoUpgradeToV1';

        const superDaoName = 'Super DAO';
        const newPeriodConfig = {
          periodDuration: 10,
          votingPeriodLength: 20,
          gracePeriodLength: 30
        };
        let superDaoV0Contract;
        let newSuperDaoContract;
        let superDaoV1Factory;
        let superDaoOptions;

        // eslint-disable-next-line no-undef
        before(async function b() {
          await deployV0();
          const coaContract = await deployments.getLastDeployedContract(
            coaV0Name
          );
          const superDaoV0Factory = await deployments.getContractFactory(
            superDaoV0Name
          );
          const daosLength = await coaContract.getDaosLength();
          const superDaoV0ContractAddr = await coaContract.daos(daosLength - 1);
          superDaoV0Contract = await superDaoV0Factory.attach(
            superDaoV0ContractAddr
          );
          superDaoV1Factory = await deployments.getContractFactory(
            superDaoV1Name
          );
          superDaoOptions = {
            unsafeAllowCustomTypes: true,
            contractName: superDaoV1Name,
            upgradeContractFunction: superDaoUpgradeFunction,
            upgradeContractFunctionParams: [
              whitelistAddress,
              coaAddress,
              gsnConfig.relayHubAddress,
              ...Object.values(newPeriodConfig)
            ]
          };
          newSuperDaoContract = await deployments.upgradeContract(
            superDaoV0Contract.address,
            superDaoV1Factory,
            superDaoOptions
          );
        });

        it('should be able to upgrade from v0 to v1', async () => {
          assert.equal(newSuperDaoContract.address, superDaoV0Contract.address);
        });

        it('upgrade should maintain storage', async () => {
          const returnedDaoName = await newSuperDaoContract.name();
          assert.equal(returnedDaoName, superDaoName);
        });

        it('upgrade should set whiteList, coa addresses', async () => {
          const returnedWhiteListAddress = await newSuperDaoContract.whitelist();
          const returnedCoaAddress = await newSuperDaoContract.coaAddress();
          assert.equal(
            returnedWhiteListAddress.toLowerCase(),
            whitelistAddress.toLowerCase()
          );
          assert.equal(
            returnedCoaAddress.toLowerCase(),
            coaAddress.toLowerCase()
          );
        });

        it('upgrade should set periodDuration and period lengths', async () => {
          const returnedPeriodDuration = await newSuperDaoContract.periodDuration();
          const returnedVotingPeriodLength = await newSuperDaoContract.votingPeriodLength();
          const returnedGracePeriodLength = await newSuperDaoContract.gracePeriodLength();
          const returnedProcessingPeriodLength = await newSuperDaoContract.processingPeriodLength();
          assert.equal(
            returnedPeriodDuration.toNumber(),
            newPeriodConfig.periodDuration
          );
          assert.equal(
            returnedVotingPeriodLength.toNumber(),
            newPeriodConfig.votingPeriodLength
          );
          assert.equal(
            returnedGracePeriodLength.toNumber(),
            newPeriodConfig.gracePeriodLength
          );
          assert.equal(
            returnedProcessingPeriodLength.toNumber(),
            newPeriodConfig.votingPeriodLength +
              newPeriodConfig.gracePeriodLength
          );
        });
      });

      describe('DAO contract', () => {
        const daoUpgradeFunction = 'daoUpgradeToV1';

        const daoName = 'aDaoName';
        const newPeriodConfig = {
          periodDuration: 10,
          votingPeriodLength: 20,
          gracePeriodLength: 30
        };
        let daoV0Contract;
        let newDaoContract;
        let daoV1Factory;
        let daoOptions;

        // eslint-disable-next-line no-undef
        before(async function b() {
          await deployV0();
          const coaContract = await deployments.getLastDeployedContract(
            coaV0Name
          );
          await coaContract.createDAO(daoName, daoCreator);
          const daoV0Factory = await deployments.getContractFactory(daoV0Name);
          const daosLength = await coaContract.getDaosLength();
          const daoV0ContractAddr = await coaContract.daos(daosLength - 1);
          daoV0Contract = await daoV0Factory.attach(daoV0ContractAddr);
          daoV1Factory = await deployments.getContractFactory(daoV1Name);
          daoOptions = {
            unsafeAllowCustomTypes: true,
            contractName: daoV1Name,
            upgradeContractFunction: daoUpgradeFunction,
            upgradeContractFunctionParams: [
              whitelistAddress,
              coaAddress,
              gsnConfig.relayHubAddress,
              ...Object.values(newPeriodConfig)
            ]
          };
          newDaoContract = await deployments.upgradeContract(
            daoV0Contract.address,
            daoV1Factory,
            daoOptions
          );
        });

        it('should be able to upgrade from v0 to v1', async () => {
          assert.equal(newDaoContract.address, daoV0Contract.address);
        });

        it('upgrade should maintain storage', async () => {
          const returnedDaoName = await newDaoContract.name();
          assert.equal(returnedDaoName, daoName);
        });

        it('upgrade should set whiteList, coa addresses', async () => {
          const returnedWhiteListAddress = await newDaoContract.whitelist();
          const returnedCoaAddress = await newDaoContract.coaAddress();
          assert.equal(
            returnedWhiteListAddress.toLowerCase(),
            whitelistAddress.toLowerCase()
          );
          assert.equal(
            returnedCoaAddress.toLowerCase(),
            coaAddress.toLowerCase()
          );
        });

        it('upgrade should set periodDuration and period lengths', async () => {
          const returnedPeriodDuration = await newDaoContract.periodDuration();
          const returnedVotingPeriodLength = await newDaoContract.votingPeriodLength();
          const returnedGracePeriodLength = await newDaoContract.gracePeriodLength();
          const returnedProcessingPeriodLength = await newDaoContract.processingPeriodLength();
          assert.equal(
            returnedPeriodDuration.toNumber(),
            newPeriodConfig.periodDuration
          );
          assert.equal(
            returnedVotingPeriodLength.toNumber(),
            newPeriodConfig.votingPeriodLength
          );
          assert.equal(
            returnedGracePeriodLength.toNumber(),
            newPeriodConfig.gracePeriodLength
          );
          assert.equal(
            returnedProcessingPeriodLength.toNumber(),
            newPeriodConfig.votingPeriodLength +
              newPeriodConfig.gracePeriodLength
          );
        });
      });
    });
  }
);
