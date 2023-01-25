const { assert } = require('chai');
const { ethers } = require('ethers');

/**
 * Waits for a solidity event to be emitted
 * @param {Contract} contract contract
 * @param {string} eventName event name or '*' to watch them all
 * @param {number} timeout max amount of ms to wait for the event to happen
 */
const waitForEvent = (contract, eventName, timeout = 20000) =>
  new Promise((resolve, reject) => {
    contract.on(eventName, function callback() {
      // eslint-disable-next-line prefer-rest-params
      const event = arguments[arguments.length - 1];
      event.removeListener();
      // eslint-disable-next-line prefer-rest-params
      resolve(arguments);
    });

    setTimeout(() => {
      reject(new Error(`Timeout when waiting for ${eventName}`));
    }, timeout);
  });

const assertEqualForEventIndexedParam = (
  obtainedIndexedParam,
  expectedParam
) => {
  const hashedExpectedParam = ethers.utils.id(expectedParam);
  assert.equal(
    hashedExpectedParam,
    obtainedIndexedParam.hash,
    `Expected hash(${expectedParam}) (${hashedExpectedParam}) but got ${obtainedIndexedParam}`
  );
};

module.exports = {
  waitForEvent,
  assertEqualForEventIndexedParam
};
