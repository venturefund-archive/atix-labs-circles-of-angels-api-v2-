const { run, coa, ethereum } = require('hardhat');
const { Wallet } = require('ethers');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const daoService = require('../../rest/services/daoService');
const { injectMocks } = require('../../rest/util/injection');
const {
  userRoles,
  proposalTypeEnum,
  daoMemberRoleEnum,
  daoMemberRoleNames,
  txProposalStatus
} = require('../../rest/util/constants');

require('chai'); // needed in some tests

let mockedDaoService = Object.assign({}, daoService);
const restoreMockedDaoService = () => {
  mockedDaoService = Object.assign({}, daoService);
};

const PERIOD_DURATION_SEC = 17280;
const VOTING_PERIOD_LENGTH = 35; // periods
const GRACE_PERIOD_LENGTH = 35;
const VOTING_PERIOD_SEC = PERIOD_DURATION_SEC * VOTING_PERIOD_LENGTH;
const GRACE_PERIOD_SEC = PERIOD_DURATION_SEC * GRACE_PERIOD_LENGTH;

// TODO: change to use snapshots when hardhat supports it
const redeployContracts = async () => {
  await run('deploy', { resetStates: true });
  const coaContract = await coa.getCOA();
  // Random address is used for superDaoAddress, as the super dao was deleted from the contracts
  const superDaoAddress = await Wallet.createRandom().address;
  const { _address } = await coa.getSigner();
  return { coaContract, superDaoAddress, superUserAddress: _address };
};

const moveForwardSeconds = async seconds => {
  await ethereum.send('evm_increaseTime', [seconds]);
  await ethereum.send('evm_mine', []);
};

describe.skip('Testing daoService', () => {
  const defaultUser = {
    id: 1,
    wallet: undefined // uses member 0
  };
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR,
    firstName: 'John',
    lastName: 'Doe',
    address: '0x0000000000000000000000000000000000000000'
  };

  const ALL_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  let coaContract;
  let superDaoAddress;
  let superUserAddress;

  const applicantAddress = '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D';
  const proposerAddress = '0xf828EaDD69a8A5936d863a1621Fe2c3dC568558D';

  const newProposalTx = {
    daoId: 0,
    description: 'A description',
    applicant: applicantAddress,
    proposer: proposerAddress,
    type: proposalTypeEnum.NEW_MEMBER,
    txHash: '0x111',
    status: txProposalStatus.SENT
  };

  const newVoteTx = {
    daoId: 0,
    proposalId: 0,
    vote: true,
    voter: proposerAddress,
    txHash: '0x111',
    status: txProposalStatus.SENT
  };

  beforeAll(async () => {
    ({
      coaContract,
      superDaoAddress,
      superUserAddress
    } = await redeployContracts());

    coa.sendNewTransaction = jest.fn();
    coa.getNewProposalTransaction = jest.fn();
    coa.getProcessProposalTransaction = jest.fn();
    coa.getNewVoteTransaction = jest.fn();
    coa.getTransactionResponse = jest.fn(() => null);
    coa.getBlock = jest.fn();
  });

  const transactionService = {
    getNextNonce: jest.fn(() => 0),
    save: jest.fn(),
    hasFailed: jest.fn(() => false)
  };

  let dbVote = [];
  let dbProposal = [];
  let dbUser = [];
  const resetDb = () => {
    dbUser = [];
    dbProposal = [];
    dbVote = [];
  };

  const userService = {
    getUsers: () => dbUser,
    getVotersByAddresses: addresses => {
      if (!dbUser.length) return [];
      const users = dbUser.find(user => addresses.includes(user.address));
      if (!users) return [];
      return users.map(
        user => user.firstName.charAt(0) + user.lastName.charAt(0)
      );
    }
  };

  const voteDao = {
    findById: id => {
      const found = dbVote.find(proposal => proposal.id === id);
      if (!found) return [];
      return found;
    },
    findByTxHash: hash => {
      const found = dbVote.find(proposal => proposal.txHash === hash);
      if (!found) return;
      return found;
    },
    findByDaoAndProposalId: (daoId, proposalId) => {
      const found = dbVote.find(
        proposal =>
          proposal.daoId === daoId && proposal.proposalId === proposalId
      );
      if (!found) return [];
      return found;
    },
    addVote: ({ daoId, proposalId, vote, voter, txHash, status }) => {
      const newVoteId =
        dbVote.length > 0 ? dbVote[dbVote.length - 1].id + 1 : 1;

      const newVote = {
        id: newVoteId,
        daoId,
        proposalId,
        vote,
        voter,
        txHash,
        status
      };

      dbVote.push(newVote);
      return newVote;
    },
    updateVoteByTxHash: (hash, { status }) => {
      const found = dbVote.find(e => e.txHash === hash);
      if (!found) return;
      const updated = { ...found, status };
      dbVote[dbVote.indexOf(found)] = updated;
      return updated;
    },
    findAllSentTxs: () =>
      dbVote
        .filter(ev => ev.status === txProposalStatus.SENT)
        .map(({ id, txHash }) => ({ id, txHash }))
  };

  const proposalDao = {
    findById: id => dbProposal.find(proposal => proposal.id === id),
    findByTxHash: hash => dbProposal.find(proposal => proposal.txHash === hash),
    addProposal: ({
      daoId,
      applicant,
      proposer,
      type,
      description,
      txHash,
      status
    }) => {
      const newProposalId =
        dbProposal.length > 0 ? dbProposal[dbProposal.length - 1].id + 1 : 1;

      const newProposal = {
        id: newProposalId,
        daoId,
        applicant,
        proposer,
        type,
        description,
        txHash,
        status
      };

      dbProposal.push(newProposal);
      return newProposal;
    },
    updateProposalByTxHash: (hash, { proposalId, status }) => {
      const found = dbProposal.find(p => p.txHash === hash);
      if (!found) return;
      const updated = { ...found, proposalId, status };
      dbProposal[dbProposal.indexOf(found)] = updated;
      return updated;
    },
    findAllSentTxs: () => {
      const found = dbProposal
        .filter(p => p.status === txProposalStatus.SENT)
        .map(({ id, txHash }) => ({ id, txHash }));
      return found;
    },
    findAllSentTxsByDaoId: daoId => {
      const filtered = dbProposal.filter(
        p => p.status === txProposalStatus.SENT && p.daoId === daoId
      );
      return filtered;
    }
  };
  describe('Testing getMember method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());
    });

    it('should return the information of the existing member in the DAO', async () => {
      const response = await daoService.getMember({
        daoId: 0,
        memberAddress: superUserAddress,
        user: defaultUser
      });
      expect(response.role).toEqual(
        daoMemberRoleNames[daoMemberRoleEnum.NORMAL]
      );
      expect(response.exists).toBe(true);
    });
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          user: defaultUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('getMember'));
    });
    it('should throw an error if no member was found in the DAO with that address', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          memberAddress: ALL_ZERO_ADDRESS,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.MemberNotFound(ALL_ZERO_ADDRESS, 0));
    });
    it('should throw an error if the member address is invalid', async () => {
      await expect(
        daoService.getMember({
          daoId: 0,
          memberAddress: '0x123456',
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingMember('0x123456', 0));
    });
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        daoService.getMember({
          daoId: 1,
          memberAddress: superUserAddress,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingMember(superUserAddress, 1));
    });
  });
  describe('Testing getProposalsByDaoId method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        proposalDao,
        voteDao,
        userService
      });
    });
    beforeEach(() => {
      resetDb();
    });

    it('should return a list of all proposals in a dao', async () => {
      const daoId = 0;
      const firstMemberAddress = await run('create-member');
      const secondMemberAddress = await run('create-member');
      const firstCreatedProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: firstMemberAddress
      });
      const secondCreatedProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: secondMemberAddress
      });
      const response = await mockedDaoService.getProposalsByDaoId({
        daoId,
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      expect(response).toHaveLength(2);
      expect(response[firstCreatedProposalIndex].applicant).toEqual(
        firstMemberAddress
      );
      expect(response[firstCreatedProposalIndex].proposalType).toEqual(
        proposalTypeEnum.NEW_MEMBER
      );
      expect(response[secondCreatedProposalIndex].applicant).toEqual(
        secondMemberAddress
      );
      expect(response[secondCreatedProposalIndex].proposalType).toEqual(
        proposalTypeEnum.NEW_MEMBER
      );
      expect(response[firstCreatedProposalIndex].voters.length).toEqual(0);
      expect(response[secondCreatedProposalIndex].voters.length).toEqual(0);
      expect(response[firstCreatedProposalIndex].voterNames.length).toEqual(0);
      expect(response[secondCreatedProposalIndex].voterNames.length).toEqual(0);
    });
    it('should throw an error if any required parameters are missing', async () => {
      await expect(
        mockedDaoService.getProposalsByDaoId({
          user: defaultUser
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getProposalsByDaoId')
      );
    });
    it('should throw an error if the DAO does not exist', async () => {
      await expect(
        mockedDaoService.getProposalsByDaoId({
          daoId: 1,
          user: defaultUser
        })
      ).rejects.toThrow(errors.dao.ErrorGettingProposals(1));
    });
  });
  describe('Testing getDaos method', () => {
    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService,
        proposalDao
      });
    });

    beforeEach(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());
    });

    afterAll(() => restoreMockedDaoService());

    it('should have a list of 2 daos when getDaos is applied', async () => {
      const firstMemberAddress = await run('create-member');
      await run('create-dao', { account: firstMemberAddress });
      await run('create-dao', { account: firstMemberAddress });
      const response = await mockedDaoService.getDaos({
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      expect(response).toHaveLength(2);
    });
    // it('should have 1 proposal length when adding a proposal to a DAO', async () => {
    //   // Its the only DAO for the user, thats why is unique
    //   const uniqueDaoIndex = 0;
    //   const firstMemberAddress = await run('create-member');
    //   const secondMemberAddress = await run('create-member');
    //   const daoAddress = await run('create-dao', {
    //     account: firstMemberAddress
    //   });
    //   await run('propose-member-to-dao', {
    //     daoaddress: daoAddress,
    //     applicant: secondMemberAddress
    //   });
    //   const user = { ...defaultUser, wallet: { address: firstMemberAddress } };
    //   const response = await mockedDaoService.getDaos({ user });
    //   const proposalAmounts = Number(response[uniqueDaoIndex].proposalsAmount);
    //   expect(response).toHaveLength(1);
    //   expect(proposalAmounts).toEqual(1);
    // });
    it('should have an empty list of DAOs if the userdoesnt belong to anyone', async () => {
      const firstMemberAddress = await run('create-member');
      const response = await mockedDaoService.getDaos({
        user: { ...defaultUser, wallet: { address: firstMemberAddress } }
      });
      expect(response).toHaveLength(0);
    });
    it('should throw an error if method dont receive any user', async () => {
      await expect(mockedDaoService.getDaos({})).rejects.toThrow(
        errors.common.RequiredParamsMissing('getDaos')
      );
    });
  });
  describe('Testing getUsers method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        userService
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur);
    });

    it('should have an empty list superDao when no Users are added', async () => {
      const superDaoId = 0;
      const response = await mockedDaoService.getUsers({ daoId: superDaoId });
      expect(response).toHaveLength(0);
    });
    it('should throw an error when no daoId is provided to the method', async () => {
      await expect(mockedDaoService.getUsers({})).rejects.toThrow(
        errors.common.RequiredParamsMissing('getUsers')
      );
    });
    it('should throw an error when the id of the dao is non existent', async () => {
      const nonExistentDaoId = 1;
      await expect(
        mockedDaoService.getUsers({ daoId: nonExistentDaoId })
      ).rejects.toThrow(errors.dao.ErrorGettingDaoUsers(nonExistentDaoId));
    });
    // TODO: revisar porque falla solo en gitlabci
    // it('should have 1 member when Dao has one user', async () => {
    //   const firstMemberAddress = await run('create-member');
    //   const secondMemberAddress = await run('create-member');
    //   const firstUser = { ...userEntrepreneur, address: firstMemberAddress };
    //   const secondUser = { ...userEntrepreneur, address: secondMemberAddress };
    //   dbUser.push(firstUser);
    //   dbUser.push(secondUser);
    //   await run('create-dao', { account: firstMemberAddress });
    //   const response = await mockedDaoService.getUsers({ daoId: 1 });
    //   expect(response).toHaveLength(1);
    // });
  });
  describe('Testing getNewProposalTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    const superDaoId = 0;
    const description = 'a description';

    beforeAll(() => {
      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    beforeEach(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned transaction when proposal is new member and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.NEW_MEMBER
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should return the unsigned transaction when proposal is new dao and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.NEW_DAO
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should return the unsigned transaction when proposal is new banker and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.ASSIGN_BANK
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should return the unsigned transaction when proposal is new curator and the encrypted user wallet', async () => {
      const applicant = await run('create-member');
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewProposalTransaction({
        daoId: superDaoId,
        userWallet,
        applicant,
        description,
        type: proposalTypeEnum.ASSIGN_CURATOR
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing', async () => {
      const applicant = await run('create-member');
      await expect(
        mockedDaoService.getNewProposalTransaction({
          daoId: superDaoId,
          userWallet,
          applicant
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNewProposalTransaction')
      );
    });
  });
  describe('Testing sendNewProposalTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        proposalDao
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed tx to the contract, save it and return the daoId', async () => {
      const applicant = userWallet.address;
      const description = 'A description';
      const type = proposalTypeEnum.NEW_MEMBER;
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendNewProposalTransaction({
        daoId: superDaoId,
        applicant,
        description,
        type,
        signedTransaction,
        userWallet
      });
      expect(response).toEqual(superDaoId);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendNewProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendNewProposalTransaction')
      );
    });
  });
  describe('Testing getNewVoteTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    const yesVote = true;
    const superDaoId = 0;

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned vote transaction and the encrypted user wallet', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });

      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getNewVoteTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getNewVoteTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet,
        vote: yesVote
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.getNewVoteTransaction({
          daoId: superDaoId,
          userWallet,
          vote: yesVote
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNewVoteTransaction')
      );
    });
  });
  describe('Testing sendNewVoteTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        voteDao
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed vote tx to the contract, save it and return the daoId', async () => {
      const applicant = userWallet.address;
      const vote = true;
      const proposalId = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant
      });
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendNewVoteTransaction({
        daoId: superDaoId,
        proposalId,
        applicant,
        vote,
        userWallet,
        signedTransaction
      });
      expect(response).toEqual(superDaoId);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendNewVoteTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendNewVoteTransaction')
      );
    });
  });
  describe('Testing getProcessTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    const superDaoId = 0;

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should return the unsigned process transaction and the encrypted user wallet', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });

      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getProcessProposalTransaction.mockReturnValueOnce(unsignedTx);
      const response = await mockedDaoService.getProcessProposalTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing, in this case proposalId', async () => {
      await expect(
        mockedDaoService.getProcessProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getProcessProposalTransaction')
      );
    });
  });
  describe('Testing sendNewProcessTransaction', () => {
    const superDaoId = 0;
    const signedTransaction = '0x11122233548979870';
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService
      });
    });

    afterAll(() => restoreMockedDaoService());

    it('should send the signed processed tx to the contract, save it and return the proposalId', async () => {
      const createdProposalIndex = await run('propose-member-to-dao', {
        daoaddress: superDaoAddress,
        applicant: userWallet.address
      });
      coa.sendNewTransaction.mockReturnValueOnce({
        hash: '0x148Ea11233'
      });
      const response = await mockedDaoService.sendProcessProposalTransaction({
        daoId: superDaoId,
        proposalId: createdProposalIndex,
        userWallet,
        signedTransaction
      });
      expect(response).toEqual(createdProposalIndex);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.sendProcessProposalTransaction({
          daoId: superDaoId,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendProcessProposalTransaction')
      );
    });
  });
  describe('Testing updateProposalStatusByTxHash method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        proposalDao
      });
    });
    beforeEach(() => {
      resetDb();
      dbProposal.push(newProposalTx);
    });

    afterAll(() => restoreMockedDaoService());

    it('should update the proposal status and return its id', async () => {
      const proposalId = dbProposal.length - 1;
      const response = await mockedDaoService.updateProposalByTxHash(
        newProposalTx.txHash,
        txProposalStatus.CONFIRMED,
        proposalId
      );
      expect(response).toEqual({ proposalId });
      const updated = proposalDao.findByTxHash(newProposalTx.txHash);
      expect(updated.status).toEqual(txProposalStatus.CONFIRMED);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.updateProposalByTxHash(newProposalTx.txHash)
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('updateProposalByTxHash')
      );
    });
    it('should throw an error if the proposal does not exist', async () => {
      const proposalId = dbProposal.length - 1;
      await expect(
        mockedDaoService.updateProposalByTxHash(
          '0x0',
          txProposalStatus.CONFIRMED,
          proposalId
        )
      ).rejects.toThrow(
        errors.common.CantFindModelWithTxHash('proposal', '0x0')
      );
    });
    it('should throw an error if the status is not valid', async () => {
      const proposalId = dbProposal.length - 1;
      await expect(
        mockedDaoService.updateProposalByTxHash(
          newProposalTx.txHash,
          'wrong status',
          proposalId
        )
      ).rejects.toThrow(errors.dao.ProposalStatusNotValid('wrong status'));
    });
    it('should throw an error if the proposal status cannot be changed', async () => {
      const proposalId = dbProposal.length - 1;
      dbProposal = [{ ...newProposalTx, status: txProposalStatus.CONFIRMED }];
      await expect(
        mockedDaoService.updateProposalByTxHash(
          newProposalTx.txHash,
          txProposalStatus.FAILED,
          proposalId
        )
      ).rejects.toThrow(
        errors.dao.ProposalStatusCannotChange(txProposalStatus.CONFIRMED)
      );
    });
  });
  describe('Testing updateFailedProposalTransactions method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        proposalDao
      });
    });

    beforeEach(() => {
      resetDb();
      dbProposal.push(newProposalTx);
    });

    afterAll(() => restoreMockedDaoService());

    it('should update all failed proposals and return an array with their ids', async () => {
      transactionService.hasFailed.mockReturnValueOnce(true);
      await mockedDaoService.updateFailedProposalTransactions();
      const updated = dbProposal.find(p => p.id === newProposalTx.id);
      expect(updated.status).toEqual(txProposalStatus.FAILED);
    });
    it('should return an empty array if no txs failed', async () => {
      transactionService.hasFailed.mockReturnValueOnce(false);
      const response = await mockedDaoService.updateFailedProposalTransactions();
      expect(response).toEqual([]);
    });
  });
  describe('Testing updateVoteStatusByTxHash method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        voteDao
      });
    });
    beforeEach(() => {
      resetDb();
      dbVote.push(newVoteTx);
    });

    afterAll(() => restoreMockedDaoService());

    it('should update the vote status and return its id', async () => {
      const response = await mockedDaoService.updateVoteByTxHash(
        newVoteTx.txHash,
        txProposalStatus.CONFIRMED
      );
      expect(response).toEqual({ proposalId: newVoteTx.proposalId });
      const updated = voteDao.findByTxHash(newVoteTx.txHash);
      expect(updated.status).toEqual(txProposalStatus.CONFIRMED);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        mockedDaoService.updateVoteByTxHash(newProposalTx.txHash)
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('updateVoteByTxHash')
      );
    });
    it('should throw an error if the vote does not exist', async () => {
      const wrongTxHash = '0x55555555555';
      await expect(
        mockedDaoService.updateVoteByTxHash(
          wrongTxHash,
          txProposalStatus.CONFIRMED
        )
      ).rejects.toThrow(
        errors.common.CantFindModelWithTxHash('vote', wrongTxHash)
      );
    });
    it('should throw an error if the status is not valid', async () => {
      await expect(
        mockedDaoService.updateVoteByTxHash(newVoteTx.txHash, 'wrong status')
      ).rejects.toThrow(errors.dao.VoteStatusNotValid('wrong status'));
    });
    it('should throw an error if the vote status cannot be changed', async () => {
      dbVote = [{ ...newVoteTx, status: txProposalStatus.CONFIRMED }];
      await expect(
        mockedDaoService.updateVoteByTxHash(
          newVoteTx.txHash,
          txProposalStatus.FAILED
        )
      ).rejects.toThrow(
        errors.dao.VoteStatusCannotChange(txProposalStatus.CONFIRMED)
      );
    });
  });
  describe('Testing updateFailedVoteTransactions method', () => {
    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        voteDao
      });
    });

    beforeEach(() => {
      resetDb();
      dbVote.push(newVoteTx);
    });

    afterAll(() => restoreMockedDaoService());

    it('should update all failed votes and return an array with their ids', async () => {
      transactionService.hasFailed.mockReturnValueOnce(true);
      await mockedDaoService.updateFailedVoteTransactions();
      const updated = dbVote.find(v => v.id === newVoteTx.id);
      expect(updated.status).toEqual(txProposalStatus.FAILED);
    });
    it('should return an empty array if no txs failed', async () => {
      transactionService.hasFailed.mockReturnValueOnce(false);
      const response = await mockedDaoService.updateFailedVoteTransactions();
      expect(response).toEqual([]);
    });
  });
  describe('Testing getSentProposals method', () => {
    const superDaoId = 0;

    beforeAll(async () => {
      ({
        coaContract,
        superDaoAddress,
        superUserAddress
      } = await redeployContracts());

      injectMocks(mockedDaoService, {
        transactionService,
        proposalDao
      });
    });

    beforeEach(() => {
      resetDb();
    });

    it('should return an empty array if no txs where sent', async () => {
      const sentProposals = await mockedDaoService.getSentProposals(superDaoId);
      expect(sentProposals.length).toEqual(0);
    });
    it('should return a size of 2 proposals after adding two proposals to the DAO', async () => {
      dbProposal.push(newProposalTx);
      dbProposal.push(newProposalTx);
      const sentProposals = await mockedDaoService.getSentProposals(superDaoId);
      expect(sentProposals.length).toEqual(2);
    });
    it('should return a size of 1 proposal after adding one proposal to one DAO, and 1 to another DAO', async () => {
      const anotherProposalTx = {
        daoId: 1,
        description: 'A description',
        applicant: applicantAddress,
        proposer: proposerAddress,
        type: proposalTypeEnum.NEW_MEMBER,
        txHash: '0x111',
        status: txProposalStatus.SENT
      };
      dbProposal.push(newProposalTx);
      dbProposal.push(anotherProposalTx);
      const sentProposals = await mockedDaoService.getSentProposals(superDaoId);
      expect(sentProposals.length).toEqual(1);
    });
  });
});
