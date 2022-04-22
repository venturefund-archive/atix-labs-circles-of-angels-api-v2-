module.exports = {
  identity: 'project_oracle',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    user: {
      columnName: 'userId',
      model: 'user'
    }
  }
};
