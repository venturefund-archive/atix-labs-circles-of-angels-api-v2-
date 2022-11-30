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
  return fetch(`${token.apiBaseUrl}?${queryParams}${contractAddressQueryParam}`)
    .then(response => response.json())
    .then(data =>
      data.result
        .filter(transaction => transaction.value !== '0')
        .map(transaction => ({
          ...transaction,
          tokenSymbol: token.symbol,
          decimals: token.decimals
        }))
    );
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
  if (!type) return { transactions };
  const isSentType = type === txTypes.SENT;
  return transactions.filter(
    transaction =>
      (isSentType
        ? transaction.from.toLowerCase()
        : transaction.to.toLowerCase()) === address.toLowerCase()
  );
};

const formatTransactions = transactions =>
  transactions.map(
    ({ hash, value, timeStamp, decimals, tokenSymbol, from, to }) => ({
      txHash: hash,
      value: Number(value) / 10 ** decimals,
      tokenSymbol,
      from,
      to,
      timestamp: dateFormat(timeStamp)
    })
  );

module.exports = {
  async getTransactions({ currency, address, type }) {
    logger.info('[BlockchainService] :: Entering getTransactions method');
    const getTransactions = getTransactionsMap[currency];
    const transactions = await getTransactions({ address });
    if (!type) return { transactions: formatTransactions(transactions) };
    const transactionsFiltered = filterByType({ transactions, address, type });
    return { transactions: formatTransactions(transactionsFiltered) };
  }
};
