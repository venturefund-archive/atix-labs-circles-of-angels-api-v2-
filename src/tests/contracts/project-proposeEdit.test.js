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

contract('ProjectsRegistry.sol - propose edits', () => {
  let projectRegistry;

  const projectData = {
    id: 1,
    ipfsHash: 'an_ipfs_hash'
  };
  const newIpfsHash = 'other_ipfs_hash';
  const otherIpfsHash = 'even_another_ipfs_hash';
  const proposerEmail = "example@gmail.com";
  let proposerSigner, proposerAddress;
  let otherProposerSigner, otherProposerAddress;


  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts and setup', async function be() {
    // Deploy contracts
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await redeployContracts(['ProjectsRegistry']);
    projectRegistry = await deployments.getLastDeployedContract('ProjectsRegistry');

    // Setup: create a project
    await projectRegistry.createProject(projectData.id, projectData.ipfsHash);

    const signers = await ethers.getSigners();
    proposerSigner = signers[1];
    proposerAddress = await proposerSigner.getAddress();

    otherProposerSigner = signers[2];
    otherProposerAddress = await otherProposerSigner.getAddress();
  });

  it('Should allow the owner to relay an edit proposal', async () => {
    await proposeProjectEdit(projectRegistry, projectData.id, newIpfsHash, proposerEmail, proposerSigner);
    
    // Verify the edit proposal was added correctly
    const proposedEditAdded = await projectRegistry.pendingEdits(projectData.id, proposerAddress);
    assert.equal(proposedEditAdded.ipfsHash, newIpfsHash);
    assert.equal(proposedEditAdded.authorAddress, proposerAddress);
    assert.equal(proposedEditAdded.authorEmail, proposerEmail);
  });

  it('Should allow a proposer to override his proposal', async () => {
    // First proposal
    await proposeProjectEdit(projectRegistry, projectData.id, newIpfsHash, proposerEmail, proposerSigner);

    // Second proposal
    await proposeProjectEdit(projectRegistry, projectData.id, otherIpfsHash, proposerEmail, proposerSigner);
      
    // Verify the edit proposal was updated correctly
    const proposedEditAdded = await projectRegistry.pendingEdits(projectData.id, proposerAddress);
    assert.equal(proposedEditAdded.ipfsHash, otherIpfsHash);
    assert.equal(proposedEditAdded.authorAddress, proposerAddress);
    assert.equal(proposedEditAdded.authorEmail, proposerEmail);
  });

  it('Should allow multiple proposal to exists for the same project', async () => {
    // Proposal by first proposer
    await proposeProjectEdit(projectRegistry, projectData.id, newIpfsHash, proposerEmail, proposerSigner);

    // Proposal by second proposer
    await proposeProjectEdit(projectRegistry, projectData.id, otherIpfsHash, proposerEmail, otherProposerSigner);
      
    // Verify the first edit proposal still exists
    const firstProposalEditAdded = await projectRegistry.pendingEdits(projectData.id, proposerAddress);
    assert.equal(firstProposalEditAdded.ipfsHash, newIpfsHash);
    assert.equal(firstProposalEditAdded.authorAddress, proposerAddress);

    // Verify the second edit proposal also exists
    const secondProposalEditAdded = await projectRegistry.pendingEdits(projectData.id, otherProposerAddress);
    assert.equal(secondProposalEditAdded.ipfsHash, otherIpfsHash);
    assert.equal(secondProposalEditAdded.authorAddress, otherProposerAddress);
  });

  it('Should fail when trying to relay an edit for a non existing project', async () => {
    const nonExistingProjectId = projectData.id + 1;
    await throwsAsync(
      proposeProjectEdit(projectRegistry, nonExistingProjectId, newIpfsHash, proposerEmail, proposerSigner),
      getVmRevertExceptionWithMsg(projectRegistryErrors.editingNonExistingProject)
    );
  });

  it('Should fail when trying to relay an edit and the sender is not the owner', async () => {
    await throwsAsync(
      proposeProjectEdit(projectRegistry, projectData.id, newIpfsHash, proposerEmail, proposerSigner, proposerSigner),
      getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
    );
  });

});
