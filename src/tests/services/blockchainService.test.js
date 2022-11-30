const blockchainService = require('../../rest/services/blockchainService');
const { txTypes } = require('../../rest/util/constants');
const { API_RESPONSE } = require('./mockApi');

jest.mock('../../rest/services/tokenService', () => ({
  getTokenBySymbol: jest.fn(() =>
    Promise.resolve({
      id: 1,
      name: 'ETC',
      symbol: 'ETC',
      decimals: 18
    })
  )
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(API_RESPONSE)
  })
);

describe('Testing blockchainService', () => {
  const ADDRESS = '0x166c8dbcd7447c1fcd265130d3d278d47a3bc7b2';
  describe('Testing getTransactions', () => {
    it('Should return all sent transactions', async () => {
      const response = await blockchainService.getTransactions({
        currency: 'ETC',
        address: ADDRESS,
        type: txTypes.SENT
      });
      expect(response.transactions).toMatchSnapshot();
      expect(
        response.transactions.every(transaction => transaction.value !== '0')
      ).toBeTruthy();
      expect(
        response.transactions.every(transaction => transaction.from === ADDRESS)
      ).toBeTruthy();
    });

    it('Should return all received transactions', async () => {
      const response = await blockchainService.getTransactions({
        currency: 'ETC',
        address: ADDRESS,
        type: txTypes.RECEIVED
      });
      expect(response.transactions).toMatchSnapshot();
      expect(
        response.transactions.every(transaction => transaction.value !== '0')
      ).toBeTruthy();
      expect(
        response.transactions.every(transaction => transaction.to === ADDRESS)
      ).toBeTruthy();
    });
  });
});
