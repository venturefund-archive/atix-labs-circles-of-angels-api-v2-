module.exports = {
  identity: 'changelog',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    project: {
      columnName: 'projectId',
      model: 'project',
      required: true
    },
    revision: { columnName: 'revisionId', type: 'number', required: true },
    milestone: {
      columnName: 'milestoneId',
      model: 'milestone',
      required: false
    },
    activity: { columnName: 'activityId', model: 'activity', required: false },
    user: { columnName: 'userId', model: 'user', required: false },
    transaction: {
      columnName: 'transactionId',
      type: 'string',
      required: false
    },
    description: { type: 'string', required: false, allowNull: true },
    extraData: { type: 'string', required: false, allowNull: true },
    datetime: {
      type: 'string',
      autoCreatedAt: true,
      required: false
    }
  }
};
