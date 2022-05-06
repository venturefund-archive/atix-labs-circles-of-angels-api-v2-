module.exports = class COAError extends Error {
  constructor(errorDescriptor) {
    super(errorDescriptor.message);
    this.statusCode = errorDescriptor.statusCode
      ? errorDescriptor.statusCode
      : 500;
  }
};
