/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { balancesConfig } = require('config');
const { parseEther } = require('ethers').utils;
const web3 = require('@nomiclabs/buidler-web3');
const { injectMocks } = require('../../rest/util/injection');
const originalBalanceService = require('../../rest/services/balancesService');
const {
  balance,
  fundRecipient
} = require('../../rest/services/helpers/gsnHelper');

let balanceService;
let mocks;
const restoreAll = () => {
  balanceService = Object.assign({}, originalBalanceService);
  mocks = Object.assign({}, originalMocks);
  jest.clearAllMocks();
};

const gsnAccount = 'fakeAccount';
const gsnSigner = {
  _address: gsnAccount
};
const gsnAccountBalance = parseEther('10000');

const originalMocks = {
  provider: {
    listAccounts: () => [gsnAccount],
    getBalance: () => gsnAccountBalance
  },
  coa: {
    getProvider: () => mocks.provider,
    getSigner: () => gsnSigner
  },
  mailService: {
    sendLowBalanceGSNAccountEmail: jest.fn()
  },
  balance: jest.fn(),
  fundRecipient: jest.fn()
};

jest.mock('../../rest/services/helpers/gsnHelper');
jest.mock('@nomiclabs/buidler-web3');

describe('BalanceService tests', () => {
  beforeAll(restoreAll);

  describe('checkGSNAccountBalance function tests', () => {
    describe('GIVEN the GSN account has enough balance', () => {
      beforeAll(async () => {
        injectMocks(balanceService, {
          mailService: mocks.mailService
        });
        await balanceService.checkGSNAccountBalance(mocks.coa);
      });

      it('SHOULD NOT send an alert email', () => {
        expect(
          mocks.mailService.sendLowBalanceGSNAccountEmail
        ).toHaveBeenCalledTimes(0);
      });
    });

    describe('GIVEN the GSN account has not enough balance', () => {
      const smallBalanceAmount = parseEther(balancesConfig.gsnAccountThreshold);

      beforeAll(async () => {
        mocks.provider = {
          ...mocks.provider,
          getBalance: () => smallBalanceAmount
        };
        injectMocks(balanceService, {
          mailService: mocks.mailService
        });
        await balanceService.checkGSNAccountBalance(mocks.coa);
      });

      it('SHOULD send an alert email', () => {
        expect(mocks.mailService.sendLowBalanceGSNAccountEmail).toBeCalledWith(
          balancesConfig.email,
          gsnAccount,
          smallBalanceAmount
        );
      });
    });
  });

  describe('checkContractBalances function tests', () => {
    const contracts = {
      coa: [{ address: 'coa_address' }],
      daos: [{ address: 'dao_address1' }, { address: 'dao_address2' }],
      claimRegistry: [
        { address: 'claim_registry_address1' },
        { address: 'claim_registry_address2' }
      ]
    };

    describe('GIVEN the all contracts have enough balance', () => {
      beforeAll(async () => {
        restoreAll();
        const enoughContractBalance = parseEther('1000');
        mocks.balance.mockReturnValue(enoughContractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        await balanceService.checkContractBalances(
          contracts,
          mocks.coa.getSigner(),
          web3
        );
      });

      it('SHOULD NOT call fundRecipient', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(0);
      });
    });

    describe('GIVEN no contract have enough balance', () => {
      const insufficientContractBalance = '0';
      const coaExpectedAmountSended = parseEther(
        balancesConfig.coa.targetBalance
      ).toString();
      const daoExpectedAmountSended = parseEther(
        balancesConfig.daos.targetBalance
      ).toString();
      const claimRegistryExpectedAmountSended = parseEther(
        balancesConfig.claimRegistry.targetBalance
      ).toString();

      beforeAll(async () => {
        restoreAll();
        mocks.balance.mockReturnValue(insufficientContractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        await balanceService.checkContractBalances(
          contracts,
          mocks.coa.getSigner(),
          web3
        );
      });

      it('SHOULD call fundRecipient always', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(5);
        expect(mocks.fundRecipient).nthCalledWith(1, web3, {
          recipient: contracts.coa[0].address,
          amount: coaExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(2, web3, {
          recipient: contracts.daos[0].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(4, web3, {
          recipient: contracts.claimRegistry[0].address,
          amount: claimRegistryExpectedAmountSended,
          from: gsnAccount
        });
      });
    });

    describe('GIVEN only dao contracts need more balance', () => {
      const contractBalance = parseEther(balancesConfig.daos.balanceThreshold);
      const daoExpectedAmountSended = parseEther(
        balancesConfig.daos.targetBalance
      ).toString();

      beforeAll(async () => {
        restoreAll();
        mocks.balance.mockReturnValue(contractBalance);
        balance.mockImplementation(mocks.balance);
        fundRecipient.mockImplementation(mocks.fundRecipient);
        await balanceService.checkContractBalances(
          contracts,
          mocks.coa.getSigner(),
          web3
        );
      });

      it('SHOULD call fundRecipient only for daos', () => {
        expect(mocks.fundRecipient).toHaveBeenCalledTimes(2);
        expect(mocks.fundRecipient).nthCalledWith(1, web3, {
          recipient: contracts.daos[0].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
        expect(mocks.fundRecipient).nthCalledWith(2, web3, {
          recipient: contracts.daos[1].address,
          amount: daoExpectedAmountSended,
          from: gsnAccount
        });
      });
    });
  });
});
