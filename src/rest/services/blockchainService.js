const logger = require('../logger');
const { txTypes } = require('../util/constants');

const cryptocurrencies = {
  ETH: 'ETH',
  USDT: 'USDT',
  ETC: 'ETC',
  rBTC: 'rBTC'
};

const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const fetchGetTransactions = apiUrl => {
  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => data.result.filter(transaction => transaction.value !== '0'));
};

const getEthTransactions = async ({ address }) => {
  return fetchGetTransactions(
    `https://blockscout.com/eth/mainnet/api?module=account&action=txlist&address=${address}&sort=desc`
  );
};

const getUsdtTransactions = async ({ address }) => {
  return fetchGetTransactions(
    `https://blockscout.com/eth/mainnet/api?module=account&action=tokentx&contractaddress=${USDT_CONTRACT_ADDRESS}&address=${address}&sort=desc`
  );
};

const getEtcTransactions = async ({ address }) => {
  return fetchGetTransactions(
    `https://blockscout.com/etc/mainnet/api?module=account&action=txlist&address=${address}&sort=desc`
  );
};

const getRbtcTransactions = async ({ address }) => {
  return fetchGetTransactions(
    `https://blockscout.com/rsk/mainnet/api?module=account&action=txlist&address=${address}&sort=desc`
  );
};

const getTransactionsMap = {
  [cryptocurrencies.ETH]: getEthTransactions,
  [cryptocurrencies.USDT]: getUsdtTransactions,
  [cryptocurrencies.ETC]: getEtcTransactions,
  [cryptocurrencies.rBTC]: getRbtcTransactions
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
  transactions.map(({ hash, value, timeStamp }) => ({
    hash,
    value,
    timestamp: timeStamp
  }));

module.exports = {
  async getTransactions({ currency, address, type }) {
    logger.info('[BlockchainService] :: Entering getTransactions method');
    const getTransactions = getTransactionsMap[currency];
    const transactions = await getTransactions({ address });
    if (!type) return { transactions };
    const transactionsFiltered = filterByType({ transactions, address, type });
    return { transactions: formatTransactions(transactionsFiltered) };
  }
};
