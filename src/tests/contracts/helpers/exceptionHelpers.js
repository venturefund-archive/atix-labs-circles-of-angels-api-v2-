const env = require('hardhat');

const commonErrors = {
    senderIsNotOwner: 'Ownable: caller is not the owner'
}

const getVmExceptionWithMsg = (exceptionMsg) => {
    return 'Error: VM Exception while processing transaction: ' + exceptionMsg;
};

const getVmRevertExceptionWithMsg = (exceptionMsg) => {
    return getVmExceptionWithMsg(`reverted with reason string \'${exceptionMsg}\'`);
};

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

module.exports = {
    commonErrors,
    getVmExceptionWithMsg,
    getVmRevertExceptionWithMsg,
    throwsAsync
};
