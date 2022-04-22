module.exports = {
  AlreadyExists: txHash => ({
    message: `A transaction with hash ${txHash} already exists`,
    status: 400
  })
};
