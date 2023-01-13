const { describe, it, beforeEach } = global;
const {
  web3,
  deployments,
  ethers
} = require('hardhat');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { redeployContracts, throwsAsync, waitForEvent } = require('./helpers/testHelpers');
const { commonErrors, getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { projectRegistryErrors } = require('./helpers/projectRegistryHelpers.js')

chai.use(solidity);

contract('ProjectsRegistry.sol - remainder flows (users and project creation)', ([creator, founder, other]) => {
  let projectRegistry;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await redeployContracts(['ProjectsRegistry']);
    projectRegistry = await deployments.getLastDeployedContract('ProjectsRegistry');
  });

  it('Deployment works', async () => {
    const projectsLength = await projectRegistry.getProjectsLength();
    assert.equal(projectsLength, 0);
  });

  describe('Create Project method', () => {
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };

    it('Should create a project', async () => {
      await projectRegistry.createProject(projectData.id, projectData.ipfsHash);

      await waitForEvent(projectRegistry, 'ProjectCreated');

      // Verify the project description
      const projectDescription = await projectRegistry.projectsDescription(projectData.id);
      assert.equal(projectDescription.ipfsHash, projectData.ipfsHash);
      assert.equal(projectDescription.authorAddress, creator);
    });

    it('Should fail when trying to create a project if already created', async () => {
      // Create the project a first time
      await projectRegistry.createProject(projectData.id, projectData.ipfsHash);

      await throwsAsync(
        projectRegistry
          .createProject(projectData.id, projectData.ipfsHash),
        getVmRevertExceptionWithMsg(projectRegistryErrors.projectAlreadyCreated)
      );
    });

    it('Should fail when trying to create a project if not owner', async () => {
      const signers = await ethers.getSigners();
      await throwsAsync(
        projectRegistry
          .connect(signers[signers.length - 1])
          .createProject(projectData.id, projectData.ipfsHash),
        getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
      );
    });
  });

  describe('Transaction', () => {
    it('Should revert when sending a tx to the contract', async () => {
      await chai.expect(
        web3.eth.sendTransaction({
          from: other,
          to: projectRegistry.address,
          value: '0x16345785d8a0000'
        })
      ).to.be.reverted;
    });
  });
});
