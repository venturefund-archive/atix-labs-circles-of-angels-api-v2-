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
const { throwsAsync } = require('./helpers/testHelpers');

chai.use(solidity);
let coa;
let registry;

async function getProjectAt(address, consultant) {
  return deployments.getContractInstance('Project', address, consultant);
}

contract('COA.sol', ([creator, founder, other]) => {
  // WARNING: Don't use arrow functions here, this.timeout doesn't work
  beforeEach('deploy contracts', async function be() {
    this.timeout(testConfig.contractTestTimeoutMilliseconds);
    await run('deploy', { resetStates: true });
    registry = await deployments.getLastDeployedContract('ClaimsRegistry');
    coa = await deployments.getLastDeployedContract('COA');
  });

  it('Deployment works', async () => {
    const { address } = registry;
    assert.equal(await coa.registry(), address);
  });

  describe('Members method', () => {
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

  describe('Project methods', () => {
    it('Should create a project', async () => {
      const project = {
        id: 1,
        name: 'a good project'
      };
      await coa.createProject(project.id, project.name);
      const instance = await getProjectAt(await coa.projects(0), other);
      assert.equal(await instance.name(), project.name);
    });
    it('Should allow the owner to add an agreement to a project', async () => {
      const agreementHash = 'an IPFS/RIF Storage hash';
      await coa.addAgreement(coa.address, agreementHash);
      const agreementAdded = await coa.agreements(coa.address);
      assert.equal(agreementAdded, agreementHash);
    });
    it('Should fail when trying to add an agreement if not owner', async () => {
      const signers = await ethers.getSigners();
      const agreementHash = 'an IPFS/RIF Storage hash';
      await throwsAsync(
        coa
          .connect(signers[signers.length - 1])
          .addAgreement(coa.address, agreementHash),
        'VM Exception while processing transaction: revert Ownable: caller is not the owner'
      );
    });
  });

  describe('DAO creation', () => {
    it('Should succeed when creating a dao', async () => {
      const daosLengthBeforeCreation = await coa.getDaosLength();
      await coa.createDAO('the dao', founder);
      const daosLengthAfterCreation = await coa.getDaosLength();
      const daoAddress = await coa.daos(daosLengthAfterCreation - 1);
      const dao = await deployments.getContractInstance(
        'DAO',
        daoAddress,
        founder
      );
      const daoMember = await dao.members(founder);

      assert.equal(
        daosLengthAfterCreation.toNumber(),
        daosLengthBeforeCreation.add(1).toNumber()
      );

      assert.equal(await dao.name(), 'the dao');
      assert.notEqual(daoMember, undefined); // he is a member
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
