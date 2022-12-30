const getVmExceptionWithMsg = (exceptionMsg) => {
    return 'VM Exception while processing transaction: ' + exceptionMsg
}

module.exports = {
    getVmExceptionWithMsg,
};
