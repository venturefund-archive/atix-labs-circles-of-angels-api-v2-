module.exports = {
  AlreadyExists: txHash => ({
    message: `A transaction with hash ${txHash} already exists`,
    status: 400
  }),
  CanNotGetTransactions: {
    message: 'Error trying to get transactions',
    status: 502
  },
  CanNotGetTransaction: txHash => ({
    message: `Error trying to get transaction ${txHash}`,
    status: 502
  })
};
