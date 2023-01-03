const commonErrors = {
    senderIsNotOwner: 'Ownable: caller is not the owner'
}

const getVmExceptionWithMsg = (exceptionMsg) => {
    return 'VM Exception while processing transaction: ' + exceptionMsg;
}

const getVmRevertExceptionWithMsg = (exceptionMsg) => {
    return getVmExceptionWithMsg('revert ' + exceptionMsg);
}

module.exports = {
    commonErrors,
    getVmExceptionWithMsg,
    getVmRevertExceptionWithMsg
};
