const { run, coa, ethers, web3 } = require('hardhat');
const logger = require('../../rest/logger');
const { sha3 } = require('../../rest/util/hash');

const deployContracts = async () => {
  await run('deploy', { resetStates: true });
  return ethers.provider.send('evm_snapshot', []);
};
const revertSnapshot = snapshot => ethers.provider.send('evm_revert', [snapshot]);

const periodSeconds = 17280;
const moveForwardAPeriod = async () => {
  await ethers.provider.send('evm_increaseTime', [periodSeconds]);
  await ethers.provider.send('evm_mine', []);
};

const votingPeriodSeconds = 604800;
const moveForwardVotingPeriod = async () => {
  await ethers.provider.send('evm_increaseTime', [votingPeriodSeconds]);
  await ethers.provider.send('evm_mine', []);
};

describe('COA plugin tests', () => {
  const address = '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A';
  const txHash =
    '0xee079ea15a894cc95cca919812f490fdf5bc494ec69781d05cecda841d3c11a2';
  let evmSnapshot;
  beforeAll(async () => {
    evmSnapshot = await deployContracts();
  });
  beforeEach(async () => {
    await revertSnapshot(evmSnapshot);
  });

  describe('Testing getUnsignedTransaction method', () => {
    it(
      'should return the unsigned transaction for ' +
        'the corresponding method and contract',
      async () => {
        const coaContract = await coa.getCOA();
        const response = await coa.getUnsignedTransaction(
          coaContract,
          'createProject(uint256,string)',
          [42, 'project_ipfs']
        );
        expect(response).toHaveProperty('to', expect.any(String));
        expect(response).toHaveProperty('gasLimit', expect.any(Number));
        expect(response).toHaveProperty('gasPrice', expect.any(Number));
        expect(response).toHaveProperty('data', expect.any(String));
      }
    );
  });

  // Skipped as the contract for the claim registry is no longer compatible with what's implemented on the backend
  describe.skip('Testing getAddClaimTransaction method', () => {
    const claim = sha3(1, 1, 1);
    it('should return the unsigned transaction for the addClaim method', async () => {
      const response = await coa.getAddClaimTransaction(
        address,
        claim,
        sha3('ipfshash'),
        true,
        1
      );
      expect(response).toHaveProperty('to', expect.any(String));
      expect(response).toHaveProperty('gasLimit', expect.any(Number));
      expect(response).toHaveProperty('data', expect.any(String));
    });
  });

  describe('Testing createProject method', () => {
    it('should send the project to the COA contract', async () => {
      const response = await coa.createProject({
        projectId: 1,
        metadataHash: 'TestProject'
      });
      expect(response).toHaveProperty('hash', expect.any(String));
      expect(response).toMatchObject({gasLimit: {_hex: '0x061a80'}});
    });
  });

  // Skipping as the project agreement was replaced by a 2 step flow of proposing and agreement and auditing
  describe.skip('Testing addProjectAgreement method', () => {
    it('should add the agreement to the COA contract', async () => {
      const response = await coa.addProjectAgreement(
        address,
        sha3('agreement')
      );
      expect(response).toHaveProperty('hash', expect.any(String));
    });
  });

  describe('Testing getTransactionCount method', () => {
    it('should return the transaction count for the address', async () => {
      const signer = await coa.getSigner();
      const initialTxNonce = await coa.getTransactionCount(signer._address);
      await signer.sendTransaction({ to: address, value: 100 });
      const finalTxNonce = await coa.getTransactionCount(signer._address);
      expect(finalTxNonce).toEqual(initialTxNonce + 1);
    });
  });

  describe('Testing getTransactionResponse method', () => {
    it('should return the transaction response for the transaction', async () => {
      const signer = await coa.getSigner();
      const { hash } = await signer.sendTransaction({
        to: address,
        value: 100
      });
      const response = await coa.getTransactionResponse(hash);
      expect(response).toHaveProperty('hash', hash);
      expect(response).toHaveProperty('blockNumber', expect.any(Number));
    });
    it('should return null if the transaction does not exist', async () => {
      const response = await coa.getTransactionResponse(txHash);
      expect(response).toEqual(null);
    });
  });

  describe('Testing getTransactionReceipt method', () => {
    it('should return the transaction receipt for the transaction', async () => {
      const signer = await coa.getSigner();
      const { hash } = await signer.sendTransaction({
        to: address,
        value: 100
      });
      const response = await coa.getTransactionReceipt(hash);
      expect(response).toHaveProperty('transactionHash', hash);
      expect(response).toHaveProperty('blockNumber', expect.any(Number));
      expect(response).toHaveProperty('status', 1);
    });
    it('should return null if the transaction does not exist', async () => {
      const response = await coa.getTransactionReceipt(txHash);
      expect(response).toEqual(null);
    });
  });

  describe('Testing getBlock method', () => {
    it('should return the block of the transaction using the number as arg', async () => {
      const signer = await coa.getSigner();
      const { hash } = await signer.sendTransaction({
        to: address,
        value: 100
      });
      const receipt = await coa.getTransactionReceipt(hash);
      expect(receipt).toHaveProperty('blockNumber', expect.any(Number));
      const block = await coa.getBlock(receipt.blockNumber);
      expect(block).toHaveProperty('hash', expect.any(String));
      expect(block).toHaveProperty('number', receipt.blockNumber);
      expect(block).toHaveProperty('timestamp', expect.any(Number));
    });
    it('should return the block of the transaction using the hash as arg', async () => {
      const signer = await coa.getSigner();
      const { hash } = await signer.sendTransaction({
        to: address,
        value: 100
      });
      const receipt = await coa.getTransactionReceipt(hash);
      expect(receipt).toHaveProperty('blockHash', expect.any(String));
      const block = await coa.getBlock(receipt.blockHash);
      expect(block).toHaveProperty('hash', receipt.blockHash);
      expect(block).toHaveProperty('number', expect.any(Number));
      expect(block).toHaveProperty('timestamp', expect.any(Number));
    });
    it('should return null if the block does not exist', async () => {
      const response = await coa.getBlock(50000);
      expect(response).toEqual(null);
    });
  });

  // Skipped as DAO contracts were deleted
  describe.skip('Testing getCurrentPeriod method', () => {
    it('should return the initial period [0] number for the superDao [0]', async () => {
      const superDaoId = 0;
      const initialPeriod = 0;
      const signer = await coa.getSigner();
      const period = await coa.getCurrentPeriod(superDaoId, signer);
      expect(Number(period)).toEqual(initialPeriod);
    });
    it('should return period 1 after moving forward one period', async () => {
      const superDaoId = 0;
      const initialPeriod = 0;
      const expectedPeriod = 1;
      const signer = await coa.getSigner();
      const period = Number(await coa.getCurrentPeriod(superDaoId, signer));
      expect(period).toEqual(initialPeriod);
      await moveForwardAPeriod();
      const currentPeriod = Number(
        await coa.getCurrentPeriod(superDaoId, signer)
      );
      expect(currentPeriod).toEqual(expectedPeriod);
    });
  });

  // Skipped as DAO contracts were deleted
  describe.skip('Testing votingPeriodExpired method', () => {
    const superDaoId = 0;
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D'
    };

    it('should return false when the proposal has just been created', async () => {
      const coaContract = await coa.getCOA();
      const superDaoAddress = await coaContract.daos(superDaoId);
      const firstProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });
      const votingPeriodExpired = await coa.votingPeriodExpired(
        superDaoId,
        firstProposalIndex
      );
      expect(votingPeriodExpired).toBe(false);
    });
    it('should return true when the voting period finishes', async () => {
      const newDaoAddress = await run('create-dao');
      const firstProposalIndex = await run('propose-member-to-dao', {
        daoaddress: newDaoAddress,
        applicant: userWallet.address
      });

      await moveForwardAPeriod();
      await moveForwardVotingPeriod();

      const votingPeriodExpired = await coa.votingPeriodExpired(
        superDaoId,
        firstProposalIndex
      );
      expect(votingPeriodExpired).toBe(true);
    });
  });

  // Skipped as DAO contracts were deleted
  describe.skip('Testing getOpenProposalsFromDao method', () => {
    beforeAll(async () => {
      evmSnapshot = await deployContracts();
    });

    const superDaoId = 0;
    const userAddress = '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D';
    const anotherUserAddress = '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A';

    it('should return 0 when there arent proposals created in the DAO', async () => {
      const openProposals = await coa.getOpenProposalsFromDao(
        superDaoId,
        userAddress
      );
      expect(openProposals).toEqual(0);
    });
    it('should return 1 when a new proposal has just been created', async () => {
      const coaContract = await coa.getCOA();
      const superDaoAddress = await coaContract.daos(superDaoId);
      await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userAddress
      });

      const openProposals = await coa.getOpenProposalsFromDao(
        superDaoId,
        userAddress
      );
      expect(openProposals).toEqual(1);
    });
    it('should return 1 when two proposals were added but one was processed', async () => {
      const newDaoAddress = await run('create-dao');

      await run('propose-member-to-dao', {
        daoaddress: newDaoAddress,
        applicant: userAddress
      });

      await run('propose-member-to-dao', {
        daoaddress: newDaoAddress,
        applicant: anotherUserAddress
      });

      await moveForwardAPeriod();

      await run('vote-proposal', {
        daoaddress: newDaoAddress,
        proposal: 0,
        vote: true
      });

      await moveForwardVotingPeriod();
      await moveForwardVotingPeriod();

      await run('process-proposal', {
        daoaddress: newDaoAddress,
        proposal: 0
      });

      const openProposals = await coa.getOpenProposalsFromDao(
        superDaoId,
        userAddress
      );
      expect(openProposals).toEqual(1);
    });

    describe('Testing getDaoPeriodLengths method', () => {
      const votingPeriodCurrentLength = 35;
      const gracePeriodCurrentLength = 35;
      const processingPeriodCurrentLength =
        votingPeriodCurrentLength + gracePeriodCurrentLength;

      it('should return different periods with its length when called', async () => {
        const votingPeriodExpired = await coa.getDaoPeriodLengths(
          superDaoId,
          userAddress
        );
        const {
          periodDuration,
          votingPeriodLength,
          gracePeriodLength,
          processingPeriodLength
        } = votingPeriodExpired;
        expect(Number(periodDuration)).toEqual(periodSeconds);
        expect(Number(votingPeriodLength)).toEqual(votingPeriodCurrentLength);
        expect(Number(gracePeriodLength)).toEqual(gracePeriodCurrentLength);
        expect(Number(processingPeriodLength)).toEqual(
          processingPeriodCurrentLength
        );
      });
    });
  });

  describe('Testing getProjects method', () => {
    beforeAll(async () => {
      evmSnapshot = await deployContracts();
    });

    const mockProjects = [
      {
        id: '1',
        name: 'project1'
      }
    ];

    it('SHOULD return an empty array if no project was created', async () => {
      const coaProjects = await coa.getProjects();
      expect(coaProjects).toEqual([]);
    });

    // Skipping as handling of projects was altered, and contracts are no longer being deployed for each one created
    it.skip('SHOULD return an array with project 1 if it was created', async () => {
      const mockProject = mockProjects[0];
      await coa.createProject({
        projectId: mockProject.id,
        metadataHash: mockProject.name
      });
      const coaProjects = await coa.getProjects();
      expect(coaProjects.length).toEqual(1);
      const returnedProject = coaProjects[0];
      expect(returnedProject.name()).resolves.toEqual(mockProject.name);
    });
  });

  describe('Testing getProjectsLength method', () => {
    beforeAll(async () => {
      evmSnapshot = await deployContracts();
    });

    const mockProjects = [
      {
        id: '1',
        name: 'project1'
      }
    ];

    it('SHOULD return 0 if no project was created', async () => {
      const coaProjectsLength = await coa.getProjectsLength();
      expect(coaProjectsLength.toString()).toEqual('0');
    });

    it('SHOULD return 1 if only 1 project was created', async () => {
      const mockProject = mockProjects[0];
      await coa.createProject({
        projectId: mockProject.id,
        metadataHash: mockProject.name
      });
      const coaProjectsLength = await coa.getProjectsLength();
      expect(coaProjectsLength.toString()).toEqual('1');
    });
  });

  // Skipped as DAO contracts were deleted
  describe.skip('Testing getAllRecipientContracts method', () => {
    beforeAll(async () => {
      evmSnapshot = await deployContracts();
    });

    const mockDaos = [
      {
        name: 'dao1'
      }
    ];

    it('SHOULD return only COA and superDao contracts if no dao was created', async () => {
      const {
        coa: returnedCoa,
        daos,
        claimRegistry
      } = await coa.getAllRecipientContracts();
      expect(returnedCoa.length).toEqual(1); // COA
      expect(daos.length).toEqual(1); // SuperDao
      expect(claimRegistry.length).toEqual(1);
    });

    it('SHOULD return mockDao if only one dao was created', async () => {
      const mockDao = mockDaos[0];
      await coa.createDAO(mockDao.name, address);
      const { daos } = await coa.getAllRecipientContracts();
      expect(daos.length).toEqual(2);
      expect(daos[0].name()).resolves.toEqual('Super DAO');
      expect(daos[1].name()).resolves.toEqual(mockDao.name);
    });
  });

  describe('Testing proposeClaim method', async () => {
    const registry = await coa.getRegistry();
    it('should send the propose claim to the ClaimsRegistry contract', async () => {
      const response = await registry.proposeClaim({
        projectId: 1,
        claimHash: 'TestClaimHash',
        proofHash: 'TestProofHash',
        activityId: 1,
        proposerEmail: 'test@email.com',
        authorizationSignature: 'signature'
      });
      expect(response).toHaveProperty('hash', expect.any(String));
    });
  });

  describe('Testing submitClaimAuditResult method', async () => {
    const registry = await coa.getRegistry();
    it('should send the submit claim audit result to the ClaimsRegistry contract', async () => {
      const response = await registry.submitClaimAuditResult({
        projectId: 1,
        claimHash: 'TestClaimHash',
        proofHash: 'TestProofHash',
        proposerAddress: 'TestAddress',
        auditorEmail: 'test@email.com',
        approved: true,
        authorizationSignature: 'signature'
      });
      expect(response).toHaveProperty('hash', expect.any(String));
    });
  });
});
