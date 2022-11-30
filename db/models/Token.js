module.exports = {
  identity: 'token',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    name: { type: 'string', required: true },
    symbol: { type: 'string', required: true },
    decimals: { type: 'number', required: true },
    apiBaseUrl: { type: 'string', required: true },
    contractAddress: { type: 'string', required: false, allowNull: true }
  }
};
