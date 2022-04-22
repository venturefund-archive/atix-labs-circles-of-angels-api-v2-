exports.clientErrorResponse = () => ({
  '4xx': {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

exports.serverErrorResponse = () => ({
  500: {
    type: 'object',
    properties: {
      status: { type: 'integer' },
      error: { type: 'string' }
    },
    description: 'Returns a message describing the error'
  }
});

exports.successResponse = response => ({
  200: {
    ...response
  }
});
