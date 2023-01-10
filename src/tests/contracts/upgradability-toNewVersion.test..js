const { run, deployments, ethers, upgrades } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');
const { testConfig } = require('config');
const { proposeAndAuditClaim, getClaimAudit } = require('./helpers/claimRegistryHelpers')

const { before } = global;

// @title UPGRADABILITY TESTS for all the contracts
// There's a describe for each upgradable contract, each test inside the describe
// may be dependant of the previous one to prove the stored values in the contract
// remain the same and the storage got migrated

// eslint-disable-next-line func-names, no-undef
contract(
  'Upgradability ==>> to new version (v2)',
  async ([
    creator,
    other
  ]) => {
    let claimsRegistryContract;
    let projectRegistryContract;
    let usersWhitelistContract;
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };
    let proposerSigner, proposerAddress;
    let auditorSigner, auditorAddress;

    // eslint-disable-next-line func-names, no-undef
    before(async function b() {
      this.timeout(testConfig.contractTestTimeoutMilliseconds);

      await run('deploy', { resetStates: true });

        claimsRegistryContract = await deployments.getLastDeployedContract(
          'ClaimsRegistry'
        );

        projectRegistryContract = await deployments.getLastDeployedContract('ProjectsRegistry');

        proxyAdminContract = await deployments.getLastDeployedContract(
          'ProxyAdmin'
        );

        usersWhitelistContract = await deployments.getLastDeployedContract(
          'UsersWhitelist'
        );

        await projectRegistryContract.createProject(projectData.id, projectData.ipfsHash);

        const signers = await ethers.getSigners();
        proposerSigner = signers[1];
        proposerAddress = await proposerSigner.getAddress();
        auditorSigner = signers[2];
        auditorAddress = await auditorSigner.getAddress();
    });

    describe('[ClaimRegistry] contract should: ', () => {
      it('Store value on the Registry mapping', async () => {
        const { proofHash, claimHash } = await proposeAndAuditClaim(
          claimsRegistryContract,
          projectData.id,
          proposerSigner,
          auditorSigner,
          {
            claim: 'this is a claim',
            proof: 'this is the proof',
            approved: true
          }
        );
        const claimAudit = await getClaimAudit(
          claimsRegistryContract,
          projectData.id,
          auditorAddress,
          claimHash
        );
        assert.equal(claimAudit.approved, true);
      });

      it('Get Upgraded, return the stored value and execute a new function of the upgraded contract', async () => {
        const claimHash = utils.id('this is a claim');

        const mockContract = await ethers.getContractFactory(
          'ClaimsRegistryV2'
        );
        const claimsRegistryV2 = await upgrades.upgradeProxy(
          claimsRegistryContract.address,
          mockContract,
          { unsafeAllowCustomTypes: true }
        );
        const claim = await getClaimAudit(
          claimsRegistryV2,
          projectData.id,
          auditorAddress,
          claimHash
        );
        assert.equal(claim.approved, true);

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

    // Note: this test upgrades the projectRegistryContract v1 to v2, so it was located after the projectRegistryContract v1 is no longer used
    describe('[ProjectRegistry] contract should', () => {
      it('Get project length before and after creating a project', async () => {
        let retProjectLength = await projectRegistryContract.getProjectsLength();
        assert.equal(retProjectLength.toString(), '1');

        const newProjectData = {
          id: 2,
          name: 'New Project 2'
        };
        await projectRegistryContract.createProject(
          newProjectData.id,
          newProjectData.name
        );
        retProjectLength = await projectRegistryContract.getProjectsLength();
        assert.equal(retProjectLength.toString(), '2');
      });

      it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
        const mockContract = await ethers.getContractFactory('ProjectsRegistryV2');
        const projectRegistryV2 = await upgrades.upgradeProxy(
          projectRegistryContract.address,
          mockContract,
          {
            unsafeAllowCustomTypes: true
          }
        );

        const retProjectLength = await projectRegistryV2.getProjectsLength();
        assert.equal(retProjectLength.toString(), '2');

        await projectRegistryV2.setTest('test');
        const retTest = await projectRegistryV2.test();
        assert.equal(retTest, 'test');
      });
    });
  });
