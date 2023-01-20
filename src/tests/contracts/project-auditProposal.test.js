const { it, beforeEach } = global;
const { deployments, ethers } = require('hardhat');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { redeployContracts, throwsAsync, waitForEvent } = require('./helpers/testHelpers');
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
  const auditIpfsHash = 'audit_ifps_hash';
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
    await projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, auditIpfsHash, proposerAddress, true);
      
    // Verify the project description was updated
    const projectDescription = await projectRegistry.projectsDescription(projectData.id);
    assert.equal(projectDescription.proposalIpfsHash, newIpfsHash);
    assert.equal(projectDescription.auditIpfsHash, auditIpfsHash);
    assert.equal(projectDescription.authorAddress, proposerAddress);
    assert.equal(projectDescription.authorEmail, proposerEmail);

    // Project edit audited event is emitted properly
    const [
      eventProject,
      eventProposer,
      eventIpfsHash,
      eventAuditIpfsHash,
      eventApproved
    ] = await waitForEvent(projectRegistry, 'ProjectEditAudited');
    assert.equal(eventProject, projectData.id);
    assert.equal(eventProposer, proposerAddress);
    assert.equal(eventIpfsHash, newIpfsHash);
    assert.equal(eventAuditIpfsHash, auditIpfsHash);
    assert.equal(eventApproved, true);
  });

  it('Should allow the owner to reject an edit proposal', async () => {
    // Approve the edit proposal
    await projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, auditIpfsHash, proposerAddress, false);
      
    // Verify the project description was not updated
    const projectDescription = await projectRegistry.projectsDescription(projectData.id);
    assert.equal(projectDescription.proposalIpfsHash, projectData.ipfsHash);

    // Project edit audited event is emitted properly
    const [
      eventProject,
      eventProposer,
      eventIpfsHash,
      eventAuditIpfsHash,
      eventApproved
    ] = await waitForEvent(projectRegistry, 'ProjectEditAudited');
    assert.equal(eventProject, projectData.id);
    assert.equal(eventProposer, proposerAddress);
    assert.equal(eventIpfsHash, newIpfsHash);
    assert.equal(eventAuditIpfsHash, auditIpfsHash);
    assert.equal(eventApproved, false);
  });

  it('Should fail when trying to audit an edit and the sender is not the owner', async () => {
    await throwsAsync(
      projectRegistry
        .connect(otherSigner)
        .submitProjectEditAuditResult(projectData.id, newIpfsHash, auditIpfsHash, proposerAddress, true),
      getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
    );
  });

  it('Should fail when trying to audit a non existing proposal', async () => {
    // this edit doesn't exist as a different proposer is being used than when it was sent
    await throwsAsync(
      projectRegistry.submitProjectEditAuditResult(projectData.id, newIpfsHash, auditIpfsHash, otherAddress, true),
      getVmRevertExceptionWithMsg(projectRegistryErrors.auditForNonExistingProposal)
    );
  });

  it('Should fail when auditing a proposal with different IPFS hash that expected', async () => {
    const invalidIpfsHash = ""
    await throwsAsync(
      projectRegistry.submitProjectEditAuditResult(projectData.id, invalidIpfsHash, auditIpfsHash, proposerAddress, true),
      getVmRevertExceptionWithMsg(projectRegistryErrors.auditWithInvalidIpfsHash)
    );
  });

});
