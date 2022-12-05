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

const fetchGetTransactions = async ({ queryParams, tokenSymbol }) => {
  logger.info('[BlockchainService] :: Entering fetchGetTransactions method');
  const token = await tokenService.getTokenBySymbol(tokenSymbol);
  if (!token) throw new COAError(errors.token.TokenNotFound);
  const contractAddressQueryParam = token.contractAddress
    ? `&contractaddress=${token.contractAddress}`
    : '';

  const response = await axios
    .get(`${token.apiBaseUrl}?${queryParams}${contractAddressQueryParam}`)
    .catch(error => {
      logger.error(
        '[BlockchainService] :: Error when fetch external API to get transactions',
        error
      );
      throw new COAError(errors.transaction.CanNotGetTransactions);
    });

  if (!response.data.result) {
    logger.error(
      '[BlockchainService] :: Result of fetch API to get transactions is null or undefined'
    );
    throw new COAError({ message: response.data.message });
  }

  return response.data.result
    .filter(transaction => transaction.value !== '0')
    .map(transaction => ({
      ...transaction,
      tokenSymbol: token.symbol,
      decimals: token.decimals
    }));
};

const getEthTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getEthTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc`,
    tokenSymbol: cryptocurrencies.ETH
  });
};

const getUsdtTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getUsdtTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=tokentx&address=${address}&sort=desc`,
    tokenSymbol: cryptocurrencies.USDT
  });
};

const getEtcTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getEtcTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc`,
    tokenSymbol: cryptocurrencies.ETC
  });
};

const getRbtcTransactions = async ({ address }) => {
  logger.info('[BlockchainService] :: Entering getRbtcTransactions method');
  return fetchGetTransactions({
    queryParams: `module=account&action=txlist&address=${address}&sort=desc`,
    tokenSymbol: cryptocurrencies.RBTC
  });
};

const getTransactionsMap = {
  [cryptocurrencies.ETH]: getEthTransactions,
  [cryptocurrencies.USDT]: getUsdtTransactions,
  [cryptocurrencies.ETC]: getEtcTransactions,
  [cryptocurrencies.RBTC]: getRbtcTransactions
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
    return { transactions: formatTransactions(transactionsFiltered) };
  }
};
