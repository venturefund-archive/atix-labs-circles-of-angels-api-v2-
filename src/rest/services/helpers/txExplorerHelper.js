const config = require('config');

const { explorerLink } = config;
const BLOCK_ROUTE = 'block';
const TX_ROUTE = 'tx';
const ADDRESSES_ROUTE = 'address';

exports.buildTxURL = txHash => `${explorerLink}/${TX_ROUTE}/${txHash}`;

exports.buildAddressURL = address =>
  `${explorerLink}/${ADDRESSES_ROUTE}/${address}`;

exports.buildBlockURL = blockNumber =>
  `${explorerLink}/${BLOCK_ROUTE}/${blockNumber}`;
