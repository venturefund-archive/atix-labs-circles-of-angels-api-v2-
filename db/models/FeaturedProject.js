// TODO: this should be deleted after the actual solution
//       that allows the user to select which projects
//       to feature in the landing is implemented
module.exports = {
  identity: 'featured_project',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    project: {
      columnName: 'projectId',
      model: 'project'
    }
  }
};
