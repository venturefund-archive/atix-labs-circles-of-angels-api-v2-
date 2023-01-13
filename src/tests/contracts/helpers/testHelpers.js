const env = require('hardhat');
const { assert } = require('chai');

/**
 * Executes an async function and checks if an error is thrown.
 *
 * @param {Promise} Promise to be waited for
 * @param {String} errorMsg error message the exception should have
 * @returns {Boolean} true if exception was thrown with proper message, false otherwise
 */
const throwsAsync = async (promise, errMsg) => {
  try {
    await promise;
  } catch (err) {
    if (env.network.name === 'coverage') return; // coverage vm does not return the error msg 🤦
    assert.equal(
      err.message ? err.message : err.error,
      errMsg,
      'Expected exception failed'
    );
    return;
  }
  assert.fail(`Expected ${errMsg} to have been thrown`);
};

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

const redeployContracts = async (
  contractsToDeploy = null
) => {
  if (contractsToDeploy != null) {
    await env.run('deploy', { resetStates: true, contractsToDeploy: contractsToDeploy });
  } else {
    await env.run('deploy', { resetStates: true });
  }
}

module.exports = {
  throwsAsync,
  waitForEvent,
  redeployContracts
};
