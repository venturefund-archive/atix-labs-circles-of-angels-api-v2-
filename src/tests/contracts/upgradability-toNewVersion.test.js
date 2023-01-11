const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');
const { testConfig } = require('config');
const { proposeAndAuditClaim, getClaimAudit } = require('./helpers/claimRegistryHelpers')
const { upgradeContract } = require('./helpers/upgradeHelpers');
const { redeployContracts } = require('./helpers/testHelpers');

const { before } = global;

// eslint-disable-next-line func-names, no-undef
contract(
  'Upgradability - to new v1 version',
  async ([
    creator
  ]) => {
    let claimsRegistryContract;
    let projectRegistryContract;
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };
    let proposerSigner;
    let auditorSigner, auditorAddress;

    // eslint-disable-next-line func-names, no-undef
    before(async function b() {
      this.timeout(testConfig.contractTestTimeoutMilliseconds);

      await redeployContracts();

      claimsRegistryContract = await deployments.getLastDeployedContract('ClaimsRegistry');

      projectRegistryContract = await deployments.getLastDeployedContract('ProjectsRegistry');
      await projectRegistryContract.createProject(projectData.id, projectData.ipfsHash);

      const signers = await ethers.getSigners();
      proposerSigner = signers[1];
      auditorSigner = signers[2];
      auditorAddress = await auditorSigner.getAddress();
    });

    describe('[ClaimRegistry] contract should: ', () => {
      let claimsRegistryV2;
      const initialVariable = 'mock-variable-value-claims';

      before('Store value on the Registry mapping', async () => {
        // Propose and audit claim
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

        // Perform upgrade
        await run('upgradeContractsToV1', { resetStates: true, contractsToUpgrade: ['ClaimsRegistryV1ForTests'] });
        claimsRegistryV2 = await deployments.getLastDeployedContract('ClaimsRegistryV1ForTests');
      });

      it('should maintain the same contract address', async () => {
        assert.equal(claimsRegistryContract.address, claimsRegistryV2.address);
      });

      it('upgrade should set owner', async () => {
        const returnedOwnerAddress = await claimsRegistryV2.owner();
        assert.equal(
          returnedOwnerAddress.toLowerCase(),
          creator.toLowerCase()
        );
      });

      it('Should return the stored claims', async () => {
        const claimHash = utils.id('this is a claim');
        const claim = await getClaimAudit(
          claimsRegistryV2,
          projectData.id,
          auditorAddress,
          claimHash
        );
        assert.equal(claim.approved, true);
        assert.equal(claim.auditorAddress, auditorAddress);
      });   

      it('upgrade should allow still adding claims', async () => {
        const mockClaim2 = 'mock_claim2';
        const mockApproved2 = false;
        const { claimHash : mockClaimHash2 } = await proposeAndAuditClaim(
          claimsRegistryV2,
          projectData.id,
          proposerSigner,
          auditorSigner,
          {claim: mockClaim2, proof: 'mock_proof', approved: mockApproved2}
        );
        const claim = await getClaimAudit(
          claimsRegistryV2,
          projectData.id,
          auditorAddress,
          mockClaimHash2
        );
        assert.equal(claim.approved, mockApproved2);
      });

      it('Should execute a new function of the upgraded contract', async () => {
        // Verify stored variable
        assert.equal(await claimsRegistryV2.stringVariable(), initialVariable);

        // Update variable
        const newVariable = 'test-claimsregistry';
        await claimsRegistryV2.setVariable(newVariable);
        assert.equal(await claimsRegistryV2.stringVariable(), newVariable);
      });
    });

    describe('[ProjectRegistry] contract should', () => {
      let projectRegistryV2;
      const initialVariable = 'mock-variable-value-projects';

      before('Create projects and upgrade', async () => {
        // Create projects
        let retProjectLength = await projectRegistryContract.getProjectsLength();
        assert.equal(retProjectLength, 1);

        await projectRegistryContract.createProject(
          2,
          'New Project 2'
        );
        retProjectLength = await projectRegistryContract.getProjectsLength();
        assert.equal(retProjectLength, 2);

        // Perform upgrade
        await run('upgradeContractsToV1', { resetStates: true, contractsToUpgrade: ['ProjectsRegistryV1ForTests'] });
        projectRegistryV2 = await deployments.getLastDeployedContract('ProjectsRegistryV1ForTests');
      });

      it('should maintain the same contract address', async () => {
        assert.equal(projectRegistryV2.address, projectRegistryContract.address);
      });

      it('upgrade should maintain storage', async () => {
        const retProjectLength = await projectRegistryV2.getProjectsLength();
        assert.equal(retProjectLength, 2);

        const returnedProjectId = await projectRegistryV2.projectIds(0);
        assert.equal(returnedProjectId, projectData.id);
      });

      it('upgrade should allow still creating Projects', async () => {
        // Create project
        const newProjectIpfsHash = 'New Project';
        const newProjectId = 10;
        await projectRegistryV2.createProject(newProjectId, newProjectIpfsHash);

        // Check stored correctly
        const newProjectDescription = await projectRegistryV2.projectsDescription(newProjectId);
        assert.equal(newProjectDescription.ipfsHash, newProjectIpfsHash);
      });

      it('Should execute new function from upgraded contract', async () => {
        // Verify stored variable
        assert.equal(await projectRegistryV2.stringVariable(), initialVariable);

        // Update variable
        const newVariable = 'test-projectsregistry';
        await projectRegistryV2.setVariable(newVariable);
        assert.equal(await projectRegistryV2.stringVariable(), newVariable);
      });
    });
  });
