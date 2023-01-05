const axios = require('axios');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const { txTypes } = require('../util/constants');
const { dateFormat } = require('../util/dateFormatters');
const tokenService = require('./tokenService');

const cryptocurrencies = {
  ETH: 'ETH',
  USDT: 'USDT',
  ETC: 'ETC',
  RBTC: 'RBTC'
};

const fetchGetAPI = async ({ apiBaseUrl, queryParams, errorToThrow }) => {
  const response = await axios
    .get(`${apiBaseUrl}?${queryParams}`)
    .catch(error => {
      logger.error(
        '[BlockchainService] :: Error when fetch external API',
        error
      );
      throw new COAError(errorToThrow);
    });

  if (!response.data.result) {
    logger.error(
      '[BlockchainService] :: Result of fetch API is null or undefined'
    );
    throw new COAError({ message: response.data.message });
  }

  return response;
};

const fetchGetTransactions = async ({ queryParams, tokenSymbol }) => {
  logger.info('[BlockchainService] :: Entering fetchGetTransactions method');
  const token = await tokenService.getTokenBySymbol(tokenSymbol);
  if (!token) throw new COAError(errors.token.TokenNotFound);
  const contractAddressQueryParam = token.contractAddress
    ? `&contractaddress=${token.contractAddress}`
    : '';

  const response = await fetchGetAPI({
    apiBaseUrl: token.apiBaseUrl,
    queryParams: `${queryParams}${contractAddressQueryParam}`,
    errorToThrow: errors.transaction.CanNotGetTransactions
  });

  return response.data.result
    .filter(
      transaction => transaction.value !== '0' && transaction.isError === '0'
    )
    .map(transaction => ({
      ...transaction,
      tokenSymbol: token.symbol,
      decimals: token.decimals
    }));
};

const getEthTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getEthTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc&page=0&offset=200`,
    tokenSymbol: cryptocurrencies.ETH
  });
};

const getUsdtTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getUsdtTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=tokentx&address=${address}&sort=desc&page=0&offset=200`,
    tokenSymbol: cryptocurrencies.USDT
  });
};

const getEtcTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getEtcTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc&page=0&offset=200`,
    tokenSymbol: cryptocurrencies.ETC
  });
};

const getRbtcTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getRbtcTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc&page=0&offset=200`,
    tokenSymbol: cryptocurrencies.RBTC
  });
};

const getTransactionsMap = {
  [cryptocurrencies.ETH]: getEthTransactions,
  [cryptocurrencies.USDT]: getUsdtTransactions,
  [cryptocurrencies.ETC]: getEtcTransactions,
  [cryptocurrencies.RBTC]: getRbtcTransactions
};

const fetchGetTransaction = async ({ txHash, tokenSymbol }) => {
  logger.info('[BlockchainService] :: Entering fetchGetTransactions method');
  const token = await tokenService.getTokenBySymbol(tokenSymbol);
  if (!token) throw new COAError(errors.token.TokenNotFound);

  const response = await fetchGetAPI({
    apiBaseUrl: token.apiBaseUrl,
    queryParams: `module=transaction&action=gettxinfo&txhash=${txHash}`,
    errorToThrow: errors.transaction.CanNotGetTransaction(txHash)
  });

  const transactionWithTokenInfo = {
    ...response.data.result,
    tokenSymbol: token.symbol,
    decimals: token.decimals
  };

  return transactionWithTokenInfo;
};

const fetchGraphQLGetTransaction = async ({ txHash, tokenSymbol }) => {
  logger.info('[BlockchainService] :: Entering fetchGetTransactions method');
  const token = await tokenService.getTokenBySymbol(tokenSymbol);
  if (!token) throw new COAError(errors.token.TokenNotFound);

  const response = await fetchGetAPI({
    apiBaseUrl: token.graphqlApiUrl,
    queryParams: `query={transaction(hash: ${txHash}) { hash, blockNumber, value, gasUsed }}`,
    errorToThrow: errors.transaction.CanNotGetTransaction(txHash)
  });

  const transactionWithTokenInfo = {
    ...response.data.result,
    tokenSymbol: token.symbol,
    decimals: token.decimals
  };

  return transactionWithTokenInfo;
};

const filterByType = ({ transactions, address, type }) => {
  logger.info('[BlockchainService] :: Entering filterByType method');
  const isSentType = type === txTypes.SENT;
  return transactions.filter(
    transaction =>
      (isSentType
        ? transaction.from.toLowerCase()
        : transaction.to.toLowerCase()) === address.toLowerCase()
  );
};

const formatTransactions = transactions => {
  logger.info('[BlockchainService] :: Entering formatTransactions method');
  return transactions.map(
    ({ hash, value, timeStamp, decimals, tokenSymbol, from, to }) => ({
      txHash: hash,
      value: Number(value) / 10 ** decimals,
      tokenSymbol,
      from,
      to,
      timestamp: dateFormat(timeStamp)
    })
  );
};

module.exports = {
  async getTransactions({ currency, address, type }) {
    logger.info('[BlockchainService] :: Entering getTransactions method');
    logger.info('[BlockchainService] :: About params to get transactions', {
      currency,
      address,
      type
    });
    const getTransactions = getTransactionsMap[currency];
    const transactions = await getTransactions({ address });
    logger.info(
      `[BlockchainService] :: ${transactions.length} transactions were obtained`
    );
    if (!type) return { transactions: formatTransactions(transactions) };
    const transactionsFiltered = filterByType({ transactions, address, type });
    const transactionsLimitated = transactionsFiltered.slice(0, 100);
    return { transactions: formatTransactions(transactionsLimitated) };
  },
  async getTransaction({ currency, txHash }) {
    logger.info('[BlockchainService] :: Entering getTransaction method');
    logger.info('[BlockchainService] :: About params to get transactions', {
      currency,
      txHash
    });
    const transaction = await fetchGetTransaction({
      tokenSymbol: currency,
      txHash
    });
    logger.info(`[BlockchainService] :: Transaction ${txHash} was obtained`);
    return transaction;
  }
};
