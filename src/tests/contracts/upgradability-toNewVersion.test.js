const { run, deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');
const { testConfig } = require('config');
const { proposeAndAuditClaim, getClaimAudit } = require('./helpers/claimRegistryHelpers')
const { upgradeContract } = require('./helpers/upgradeHelpers');

const { before } = global;

// eslint-disable-next-line func-names, no-undef
contract(
  'Upgradability ==>> to new version (v2)',
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

      await run('deploy', { resetStates: true });

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
      const initialVariable = "initial-var-claimsregistry";

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
        claimsRegistryV2 = await upgradeContract(
          claimsRegistryContract.address,
          'ClaimsRegistryV2',
          {
            unsafeAllowCustomTypes: true,
            upgradeContractFunction: 'claimUpgradeToV1',
            upgradeContractFunctionParams: [
              creator,
              initialVariable
            ]
          }
        );
      });

      it('Should return the stored value', async () => {
        const claimHash = utils.id('this is a claim');
        const claim = await getClaimAudit(
          claimsRegistryV2,
          projectData.id,
          auditorAddress,
          claimHash
        );
        assert.equal(claim.approved, true);
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
      const initialVariable = 'initial-var-projectsregistry';

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
        projectRegistryV2 = await upgradeContract(
          projectRegistryContract.address,
          'ProjectsRegistryV2',
          {
            unsafeAllowCustomTypes: true,
            upgradeContractFunction: 'registryUpgradeToV1',
            upgradeContractFunctionParams: [
              creator,
              initialVariable
            ]
          }
        );
      });

      it('Should continue working with the v0 behavior and storage', async () => {
        const retProjectLength = await projectRegistryV2.getProjectsLength();
        assert.equal(retProjectLength, 2);
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
