const { ACTION_TYPE } = require('../../src/rest/util/constants');

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
    revision: {
      columnName: 'revisionId',
      type: 'number',
      required: false,
      allowNull: true
    },
    milestone: {
      columnName: 'milestoneId',
      model: 'milestone',
      required: false
    },
    activity: { columnName: 'activityId', model: 'task', required: false },
    evidence: {
      columnName: 'evidenceId',
      model: 'task_evidence',
      required: false
    },
    user: { columnName: 'userId', model: 'user', required: false },
    transaction: {
      columnName: 'transactionId',
      type: 'string',
      required: false
    },
    description: { type: 'string', required: false, allowNull: true },
    action: {
      type: 'string',
      required: true,
      validations: {
        isIn: Object.values(ACTION_TYPE)
      }
    },
    datetime: {
      type: 'string',
      autoCreatedAt: true,
      required: false
    }
  }
};
