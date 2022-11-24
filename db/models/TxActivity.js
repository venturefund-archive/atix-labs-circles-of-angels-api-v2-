const { txStatusType } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'tx_activity',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    transactionHash: { type: 'string', required: true, allowNull: false },
    activity: {
      columnName: 'activityId',
      model: 'task',
      required: true
    },
    status: {
      type: 'string',
      defaultsTo: txStatusType.PENDING,
      validations: {
        isIn: Object.values(txStatusType)
      }
    },
    createdAt: { type: 'string', autoCreatedAt: true }
  }
};
