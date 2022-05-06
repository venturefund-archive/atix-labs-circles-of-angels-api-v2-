const {
  getRelayHub,
  fundRecipient: ozFundRecipient
} = require('@openzeppelin/gsn-helpers');
const { gsnConfig } = require('config');

async function balance(web3, options = {}) {
  const relayHub = getRelayHub(
    web3,
    options.relayHubAddress || gsnConfig.relayHubAddress
  );

  return relayHub.methods.balanceOf(options.recipient).call();
}

async function fundRecipient(web3, options = {}) {
  return ozFundRecipient(web3, {
    relayHubAddress: gsnConfig.relayHubAddress,
    ...options
  });
}

module.exports = {
  balance,
  fundRecipient
};
