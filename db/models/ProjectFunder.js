module.exports = {
  identity: 'project_funder',
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
