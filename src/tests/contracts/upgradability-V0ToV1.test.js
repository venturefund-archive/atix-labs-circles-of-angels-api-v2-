const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const { proposeAndAuditClaim, getClaimAudit } = require('./helpers/claimRegistryHelpers')

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
  'Upgradability ==>> from v0 to v1',
  async ([
    creator
  ]) => {
    const registryV0Name = 'ClaimsRegistry_v0';
    const registryV1Name = 'ClaimsRegistry';
    const projectRegistryV0Name = 'ProjectsRegistry_v0';
    const projectRegistryV1Name = 'ProjectsRegistry';

    before(function b() {
      this.timeout(testConfig.contractTestTimeoutMilliseconds);
    });

    describe('ClaimsRegistry contract', () => {
      let registryContract;
      let newRegistryContract;
      let registryV1Factory;
      let registryOptions;
      const claimUpgradeFunction = 'claimUpgradeToV1';

      const projectId = 100;
        
      let mockClaimHash;
      const mockProof = 'mock_proof';
      const mockApproved = true;
      const mockMilestone = 'mock_milestone';
      let proposerSigner, proposerAddress;
      let auditorSigner, auditorAddress;

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

        const signers = await ethers.getSigners();
        proposerSigner = signers[1];
        proposerAddress = await proposerSigner.getAddress();
        auditorSigner = signers[2];
        auditorAddress = await auditorSigner.getAddress();

        const mockClaim = 'mock_claim';
        const { claimHash } = await proposeAndAuditClaim(
          registryContract,
          projectId,
          proposerSigner,
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
        const claim = await getClaimAudit(
          newRegistryContract,
          projectId,
          auditorAddress,
          mockClaimHash
        );
        assert.equal(claim.approved, mockApproved);
        assert.equal(claim.auditorAddress, auditorAddress);
      });

      it('upgrade should set owner', async () => {
        const returnedOwnerAddress = await newRegistryContract.owner();
        assert.equal(
          returnedOwnerAddress.toLowerCase(),
          creator.toLowerCase()
        );
      });

      it('upgrade should allow still adding claims', async () => {
        const mockClaim2 = 'mock_claim2';
        const mockApproved2 = false;
        const { claimHash : mockClaimHash2 } = await proposeAndAuditClaim(
          newRegistryContract,
          projectId,
          proposerSigner,
          auditorSigner,
          {claim: mockClaim2, proof: mockProof, approved: mockApproved2, milestone: mockMilestone}
        );
        const claim = await getClaimAudit(
          newRegistryContract,
          projectId,
          auditorAddress,
          mockClaimHash2
        );
        assert.equal(claim.approved, mockApproved2);
      });
    });

    describe('ProjectRegistry contract', () => {
      let projectRegistryV0Contract;
      let newProjectRegistryContract;
      const projectData = {
        id: 1,
        ipfsHash: 'an_ipfs_hash'
      };

      // eslint-disable-next-line no-undef
      before(async function b() {
        await deployV0();
        projectRegistryV0Contract = await deployments.getLastDeployedContract(projectRegistryV0Name);
        await projectRegistryV0Contract.createProject(projectData.id, projectData.ipfsHash);
        const projectRegistryV1Factory = await deployments.getContractFactory(projectRegistryV1Name);
        const projectRegistryUpgradeFunction = 'registryUpgradeToV1';
        const projectRegistryOptions = {
          unsafeAllowCustomTypes: true,
          contractName: projectRegistryV1Name,
          upgradeContractFunction: projectRegistryUpgradeFunction,
          upgradeContractFunctionParams: [
            creator
          ]
        };
        newProjectRegistryContract = await deployments.upgradeContract(
          projectRegistryV0Contract.address,
          projectRegistryV1Factory,
          projectRegistryOptions
        );
      });

      it('should be able to upgrade from v0 to v1', async () => {
        assert.equal(newProjectRegistryContract.address, projectRegistryV0Contract.address);
      });

      it('upgrade should maintain storage', async () => {
        const returnedProjectId = await newProjectRegistryContract.projectIds(0);
        assert.equal(returnedProjectId, projectData.id);
      });

      it('upgrade should allow still creating Projects', async () => {
        const newProjectIpfsHash = 'New Project';
        const newProjectId = 10;
        await newProjectRegistryContract.createProject(newProjectId, newProjectIpfsHash);
        const newProjectDescription = await newProjectRegistryContract.projectsDescription(newProjectId);
        assert.equal(newProjectDescription.ipfsHash, newProjectIpfsHash);
      });
    });
  });
