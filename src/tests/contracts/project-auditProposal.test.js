const { it, beforeEach } = global;
const { deployments, ethers } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { redeployContracts, throwsAsync } = require('./helpers/testHelpers');
const { commonErrors, getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { projectRegistryErrors, proposeProjectEdit } = require('./helpers/projectRegistryHelpers.js')

chai.use(solidity);

contract('ProjectsRegistry.sol - audit project proposal', ([creator, founder, other]) => {
  let projectRegistry;

  const projectData = {
    id: 1,
    ipfsHash: 'an_ipfs_hash'
  };
  const newIpfsHash = 'other_ipfs_hash';
  const proposerEmail = "example@gmail.com";
  let proposerSigner, proposerAddress;
  let otherSigner, otherAddress;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts and setup', async function be() {
    // Deploy contracts
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await redeployContracts(['ProjectsRegistry']);
    projectRegistry = await deployments.getLastDeployedContract('ProjectsRegistry');

    // Setup: create a project and a proposal
    // Get the signers
    const signers = await ethers.getSigners();
    proposerSigner = signers[1];
    proposerAddress = await proposerSigner.getAddress();
    otherSigner = signers[signers.length - 1];
    otherAddress = await otherSigner.getAddress();
    
    // Create a project with a pending proposal
    await projectRegistry.createProject(projectData.id, projectData.ipfsHash);
    await proposeProjectEdit(projectRegistry, projectData.id, newIpfsHash, proposerEmail, proposerSigner); 
  });

  it('Should allow the owner to approve an edit proposal', async () => {
    // Approve the edit proposal
    await projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, true);
      
    // Verify the project description was updated
    const projectDescription = await projectRegistry.projectsDescription(projectData.id);
    assert.equal(projectDescription.ipfsHash, newIpfsHash);
    assert.equal(projectDescription.authorAddress, proposerAddress);
    assert.equal(projectDescription.authorEmail, proposerEmail);
  });

  it('Should allow the owner to reject an edit proposal', async () => {
    // Approve the edit proposal
    await projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, false);
      
    // Verify the project description was not updated
    const projectDescription = await projectRegistry.projectsDescription(projectData.id);
    assert.equal(projectDescription.ipfsHash, projectData.ipfsHash);
  });

  it('Should fail when trying to audit an edit and the sender is not the owner', async () => {
    await throwsAsync(
      projectRegistry
        .connect(otherSigner)
        .submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, true),
      getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
    );
  });

  it('Should fail when trying to audit a non existing proposal', async () => {
    // this edit doesn't exist as a different proposer is being used than when it was sent
    await throwsAsync(
      projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, otherAddress, true),
      getVmRevertExceptionWithMsg(projectRegistryErrors.auditForNonExistingProposal)
    );
  });

  it('Should fail when auditing a proposal with different IPFS hash that expected', async () => {
    const invalidIpfsHash = ""
    await throwsAsync(
      projectRegistry.submitProjectEditAuditResult(projectData.id, invalidIpfsHash, proposerAddress, true),
      getVmRevertExceptionWithMsg(projectRegistryErrors.auditWithInvalidIpfsHash)
    );
  });

});
