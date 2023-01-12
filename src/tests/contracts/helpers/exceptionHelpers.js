const commonErrors = {
    senderIsNotOwner: 'Ownable: caller is not the owner'
}

const getVmExceptionWithMsg = (exceptionMsg) => {
    return 'Error: VM Exception while processing transaction: ' + exceptionMsg;
}

const getVmRevertExceptionWithMsg = (exceptionMsg) => {
    return getVmExceptionWithMsg(`reverted with reason string \'${exceptionMsg}\'`);
}

module.exports = {
    commonErrors,
    getVmExceptionWithMsg,
    getVmRevertExceptionWithMsg
};
