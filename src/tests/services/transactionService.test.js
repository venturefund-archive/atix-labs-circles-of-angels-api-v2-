const { coa } = require('@nomiclabs/buidler');
const { injectMocks } = require('../../rest/util/injection');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const originalTransactionService = require('../../rest/services/transactionService');

let transactionService = Object.assign({}, originalTransactionService);
const restoreTransactionService = () => {
  transactionService = Object.assign({}, originalTransactionService);
};

describe('Testing transactionService', () => {
  // db sim
  let dbTransaction = [];
  const resetDb = () => {
    dbTransaction = [];
  };

  // data
  const zeroNonceTx = {
    sender: '0x8396741589Ae4C00Aec47982d222D248886a10ea',
    txHash:
      '0xf32c13eebaaa55c7bcbe3a0ea6036f154441d3413ad50867f80c46547d85cd81',
    nonce: 0
  };
  const oneNonceTx = {
    sender: '0x8396741589Ae4C00Aec47982d222D248886a10ea',
    txHash:
      '0xf32c13eebaaa55c7bcbe3a0ea6036f154441d3413ad50867f80c46547d85cd82',
    nonce: 1
  };
  const twoNonceTx = {
    sender: '0x8396741589Ae4C00Aec47982d222D248886a10ea',
    txHash:
      '0xf32c13eebaaa55c7bcbe3a0ea6036f154441d3413ad50867f80c46547d85cd83',
    nonce: 2
  };

  // module mocks
  const transactionDao = {
    findByTxHash: hash => dbTransaction.find(tx => tx.txHash === hash),
    save: tx => {
      const newTxId =
        dbTransaction.length > 0
          ? dbTransaction[dbTransaction.length - 1].id + 1
          : 1;
      const newTx = { ...tx, id: newTxId };
      dbTransaction.push({ ...tx, id: newTxId });
      return newTx;
    },
    findLastTxBySender: sender => {
      const sorted = dbTransaction
        .filter(tx => tx.sender === sender)
        .sort((a, b) => b.nonce - a.nonce);
      return sorted[0];
    }
  };
  const userService = {
    getUserByAddress: jest.fn()
  };

  // setup
  beforeAll(() => {
    coa.getTransactionCount = jest.fn(() => 0);
    coa.getTransactionReceipt = jest.fn();
  });
  beforeEach(() => resetDb());
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Testing save method', () => {
    beforeAll(() => {
      injectMocks(transactionService, { userService, transactionDao });
    });
    afterAll(() => restoreTransactionService());
    it('should save the transaction in database', async () => {
      const response = await transactionService.save(zeroNonceTx);
      expect(response).toEqual({ ...zeroNonceTx, id: 1 });
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        transactionService.save({ sender: '0x123' })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('save'));
    });
    it('should throw an error if a transaction with the same txHash exists', async () => {
      dbTransaction.push(zeroNonceTx);
      await expect(transactionService.save(zeroNonceTx)).rejects.toThrow(
        errors.transaction.AlreadyExists(zeroNonceTx.txHash)
      );
    });
  });

  describe('Testing getHighestNonce method', () => {
    beforeAll(() => {
      injectMocks(transactionService, { transactionDao });
    });
    afterAll(() => restoreTransactionService());
    it('should return the nonce of the tx with highest nonce for a sender', async () => {
      dbTransaction.push(zeroNonceTx, oneNonceTx, twoNonceTx);
      const response = await transactionService.getHighestNonce(
        twoNonceTx.sender
      );
      expect(response).toEqual(twoNonceTx.nonce);
    });
    it('should return -1 if the sender has not made any txs yet', async () => {
      const response = await transactionService.getHighestNonce(
        twoNonceTx.sender
      );
      expect(response).toEqual(-1);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(transactionService.getHighestNonce()).rejects.toThrow(
        errors.common.RequiredParamsMissing('getHighestNonce')
      );
    });
  });

  describe('Testing getNextNonce method', () => {
    beforeAll(() => {
      injectMocks(transactionService, { transactionDao });
    });
    afterAll(() => restoreTransactionService());
    it(
      'should return the nonce of the last tx saved in db plus 1 ' +
        'if it is the same or greater than the tx count',
      async () => {
        coa.getTransactionCount.mockReturnValueOnce(1);
        dbTransaction.push(twoNonceTx);
        const response = await transactionService.getNextNonce(
          twoNonceTx.sender
        );
        expect(response).toEqual(twoNonceTx.nonce + 1);
      }
    );
    it('should return the tx count if the sender has no txs in db', async () => {
      coa.getTransactionCount.mockReturnValueOnce(1);
      const response = await transactionService.getNextNonce(twoNonceTx.sender);
      expect(response).toEqual(1);
    });
    it(
      'should return the tx count if it is higher that ' +
        'the nonce of the last tx saved in db',
      async () => {
        dbTransaction.push(twoNonceTx);
        coa.getTransactionCount.mockReturnValueOnce(4);
        const response = await transactionService.getNextNonce(
          twoNonceTx.sender
        );
        expect(response).toEqual(4);
      }
    );
    it('should throw an error if any required param is missing', async () => {
      await expect(transactionService.getNextNonce()).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNextNonce')
      );
    });
  });

  describe('Testing hasFailed method', () => {
    it(
      'should return false if the transaction receipt ' +
        'is not null and the status is 1',
      async () => {
        coa.getTransactionReceipt.mockReturnValueOnce({
          transactionHash: '0x01',
          status: 1
        });
        const response = await transactionService.hasFailed('0x01');
        expect(response).toBe(false);
      }
    );
    it(
      'should return false if the transaction receipt ' +
        'is not null and the status is undefined',
      async () => {
        coa.getTransactionReceipt.mockReturnValueOnce({
          transactionHash: '0x01'
        });
        const response = await transactionService.hasFailed('0x01');
        expect(response).toBe(false);
      }
    );
    it('should return true if the transaction receipt is null', async () => {
      coa.getTransactionReceipt.mockReturnValueOnce(null);
      const response = await transactionService.hasFailed('0x01');
      expect(response).toBe(true);
    });
    it('should return true if the transaction receipt status is 0', async () => {
      coa.getTransactionReceipt.mockReturnValueOnce({
        transactionHash: '0x01',
        status: 0
      });
      const response = await transactionService.hasFailed('0x01');
      expect(response).toBe(true);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(transactionService.hasFailed()).rejects.toThrow(
        errors.common.RequiredParamsMissing('hasFailed')
      );
    });
  });
});
