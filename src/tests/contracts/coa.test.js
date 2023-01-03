const { describe, it, beforeEach } = global;
const {
  web3,
  run,
  deployments,
  ethers,
  coa: coaPlugin
} = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { testConfig } = require('config');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
const { throwsAsync, waitForEvent } = require('./helpers/testHelpers');
const { commonErrors, getVmRevertExceptionWithMsg } = require('./helpers/exceptionHelpers');
const { coaErrors, proposeProjectEdit } = require('./helpers/coaHelpers.js')

chai.use(solidity);

contract('COA.sol', ([creator, founder, other]) => {
  let coa;

  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    coa = await deployments.getLastDeployedContract('COA');
  });

  it('Deployment works', async () => {
    const projectsLength = await coa.getProjectsLength();
    assert.equal(projectsLength, 0);
  });

  describe('Members methods', () => {
    it('Should create a member', async () => {
      const userData = ['first user profile'];
      await coa.createMember(...userData);
      assert.equal(await coa.members(creator), userData);
    });
    it('Should migrate an existing member', async () => {
      const userData = ['first user profile'];
      await coa.migrateMember(...userData, founder);
      assert.equal(await coa.members(founder), userData);
    });
  });

  describe('Create Project method', () => {
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };

    it('Should create a project', async () => {
      await coa.createProject(projectData.id, projectData.ipfsHash);

      await waitForEvent(coa, 'ProjectCreated');

      // Verify the project description
      const projectDescription = await coa.projectsDescription(projectData.id);
      assert.equal(projectDescription.ipfsHash, projectData.ipfsHash);
      assert.equal(projectDescription.authorAddress, creator);
    });

    it('Should fail when trying to create a project if already created', async () => {
      // Create the project a first time
      await coa.createProject(projectData.id, projectData.ipfsHash);

      await throwsAsync(
        coa
          .createProject(projectData.id, projectData.ipfsHash),
        getVmRevertExceptionWithMsg(coaErrors.projectAlreadyCreated)
      );
    });

    it('Should fail when trying to create a project if not owner', async () => {
      const signers = await ethers.getSigners();
      await throwsAsync(
        coa
          .connect(signers[signers.length - 1])
          .createProject(projectData.id, projectData.ipfsHash),
        getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
      );
    });
  });

  describe('Propose project edit method', () => {
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };
    const newIpfsHash = 'other_ipfs_hash';
    const otherIpfsHash = 'even_another_ipfs_hash';
    const proposerEmail = "example@gmail.com";
    let proposerSigner, proposerAddress;
    let otherProposerSigner, otherProposerAddress;

    beforeEach('create the project', async function be() {
      await coa.createProject(projectData.id, projectData.ipfsHash);

      const signers = await ethers.getSigners();
      proposerSigner = signers[1];
      proposerAddress = await proposerSigner.getAddress();

      otherProposerSigner = signers[2];
      otherProposerAddress = await otherProposerSigner.getAddress();
    });

    it('Should allow the owner to relay an edit proposal', async () => {
      await proposeProjectEdit(coa, projectData.id, newIpfsHash, proposerEmail, proposerSigner);
      
      // Verify the edit proposal was added correctly
      const proposedEditAdded = await coa.pendingEdits(projectData.id, proposerAddress);
      assert.equal(proposedEditAdded.ipfsHash, newIpfsHash);
      assert.equal(proposedEditAdded.authorAddress, proposerAddress);
      assert.equal(proposedEditAdded.authorEmail, proposerEmail);
    });

    it('Should allow a proposer to override his proposal', async () => {
      // First proposal
      await proposeProjectEdit(coa, projectData.id, newIpfsHash, proposerEmail, proposerSigner);

      // Second proposal
      await proposeProjectEdit(coa, projectData.id, otherIpfsHash, proposerEmail, proposerSigner);
      
      // Verify the edit proposal was updated correctly
      const proposedEditAdded = await coa.pendingEdits(projectData.id, proposerAddress);
      assert.equal(proposedEditAdded.ipfsHash, otherIpfsHash);
      assert.equal(proposedEditAdded.authorAddress, proposerAddress);
      assert.equal(proposedEditAdded.authorEmail, proposerEmail);
    });

    it('Should allow multiple proposal to exists for the same project', async () => {
      // Proposal by first proposer
      await proposeProjectEdit(coa, projectData.id, newIpfsHash, proposerEmail, proposerSigner);

      // Proposal by second proposer
      await proposeProjectEdit(coa, projectData.id, otherIpfsHash, proposerEmail, otherProposerSigner);
      
      // Verify the first edit proposal still exists
      const firstProposalEditAdded = await coa.pendingEdits(projectData.id, proposerAddress);
      assert.equal(firstProposalEditAdded.ipfsHash, newIpfsHash);
      assert.equal(firstProposalEditAdded.authorAddress, proposerAddress);

      // Verify the second edit proposal also exists
      const secondProposalEditAdded = await coa.pendingEdits(projectData.id, otherProposerAddress);
      assert.equal(secondProposalEditAdded.ipfsHash, otherIpfsHash);
      assert.equal(secondProposalEditAdded.authorAddress, otherProposerAddress);
    });

    it('Should fail when trying to relay an edit for a non existing project', async () => {
      const nonExistingProjectId = projectData.id + 1;
      await throwsAsync(
        proposeProjectEdit(coa, nonExistingProjectId, newIpfsHash, proposerEmail, proposerSigner),
        getVmRevertExceptionWithMsg(coaErrors.editingNonExistingProject)
      );
    });

    it('Should fail when trying to relay an edit and the sender is not the owner', async () => {
      await throwsAsync(
        proposeProjectEdit(coa, projectData.id, newIpfsHash, proposerEmail, proposerSigner, proposerSigner),
        getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
      );
    });
  });

  describe('Audit a project edit proposal method', () => {
    const projectData = {
      id: 1,
      ipfsHash: 'an_ipfs_hash'
    };
    const newIpfsHash = 'other_ipfs_hash';
    const proposerEmail = "example@gmail.com";
    let proposerSigner, proposerAddress;
    let otherSigner, otherAddress;

    beforeEach('create the project and a proposal', async function be() {
      // Get the signers
      const signers = await ethers.getSigners();
      proposerSigner = signers[1];
      proposerAddress = await proposerSigner.getAddress();
      otherSigner = signers[signers.length - 1];
      otherAddress = await otherSigner.getAddress();

      // Create a project with a pending proposal
      await coa.createProject(projectData.id, projectData.ipfsHash);
      await proposeProjectEdit(coa, projectData.id, newIpfsHash, proposerEmail, proposerSigner); 
    });

    it('Should allow the owner to approve an edit proposal', async () => {
      // Approve the edit proposal
      await coa.submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, true);
      
      // Verify the project description was updated
      const projectDescription = await coa.projectsDescription(projectData.id);
      assert.equal(projectDescription.ipfsHash, newIpfsHash);
      assert.equal(projectDescription.authorAddress, proposerAddress);
      assert.equal(projectDescription.authorEmail, proposerEmail);
    });

    it('Should allow the owner to reject an edit proposal', async () => {
      // Approve the edit proposal
      await coa.submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, false);
      
      // Verify the project description was not updated
      const projectDescription = await coa.projectsDescription(projectData.id);
      assert.equal(projectDescription.ipfsHash, projectData.ipfsHash);
    });

    it('Should fail when trying to audit an edit and the sender is not the owner', async () => {
      await throwsAsync(
        coa
          .connect(otherSigner)
          .submitProjectEditAuditResult(projectData.id, newIpfsHash, proposerAddress, true),
        getVmRevertExceptionWithMsg(commonErrors.senderIsNotOwner)
      );
    });

    it('Should fail when trying to audit a non existing proposal', async () => {
      // this edit doesn't exist as a different proposer is being used than when it was sent
      await throwsAsync(
        coa.submitProjectEditAuditResult(projectData.id, newIpfsHash, otherAddress, true),
        getVmRevertExceptionWithMsg(coaErrors.auditForNonExistingProposal)
      );
    });

    it('Should fail when auditing a proposal with different IPFS hash that expected', async () => {
      const invalidIpfsHash = ""
      await throwsAsync(
        coa.submitProjectEditAuditResult(projectData.id, invalidIpfsHash, proposerAddress, true),
        getVmRevertExceptionWithMsg(coaErrors.auditWithInvalidIpfsHash)
      );
    });
  });

  describe('Transaction', () => {
    it('Should revert when sending a tx to the contract', async () => {
      await chai.expect(
        web3.eth.sendTransaction({
          from: other,
          to: coa.address,
          value: '0x16345785d8a0000'
        })
      ).to.be.reverted;
    });
  });
});
