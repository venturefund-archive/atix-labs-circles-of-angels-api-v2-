exports.idParam = (description, param, type = 'integer') => ({
  type: 'object',
  properties: {
    [param]: {
      type,
      description
    }
  }
});
