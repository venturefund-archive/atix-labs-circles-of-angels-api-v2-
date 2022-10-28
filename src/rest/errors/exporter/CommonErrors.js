module.exports = {
  RequiredParamsMissing: method => ({
    message: `Required params are missing for method ${method}`,
    statusCode: 400
  }),
  CantFindModelWithId: (model, id) => ({
    message: `Cant find ${model} with id ${id}`,
    statusCode: 400
  }),
  ErrorGetting: model => ({
    message: `Error getting ${model}`,
    statusCode: 500
  }),
  UserNotAuthorized: userId => ({
    message: `User ${userId} not authorized for this action`,
    statusCode: 401
  }),
  InvalidStatus: (model, status) => ({
    message: `Can't make this action when the ${model} is in ${status} status`,
    statusCode: 400
  }),
  CantFindModelWithAddress: (model, address) => ({
    message: `Can't find ${model} with address ${address}`,
    statusCode: 400
  }),
  CantFindModelWithTxHash: (model, txHash) => ({
    message: `Can't find ${model} with txHash ${txHash}`,
    statusCode: 400
  }),
  ErrorCreating: model => ({
    message: `There was an error creating ${model}`,
    statusCode: 500
  })
};
