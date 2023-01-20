const env = require('hardhat');

const commonErrors = {
    senderIsNotOwner: 'Ownable: caller is not the owner'
}

const getVmExceptionWithMsg = (exceptionMsg) => {
    return 'VM Exception while processing transaction: ' + exceptionMsg;
}

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
    const obtainedErrorMessage = err.message ? err.message : err.error;
    // Coverage has Error prefix while tests don't
    const withCorrectErrorMessage =
      obtainedErrorMessage == errMsg ||
      obtainedErrorMessage == "Error: " + errMsg
    assert.isTrue(
      withCorrectErrorMessage,
      `Expected exception ${errMsg} failed but got ${obtainedErrorMessage}`
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
