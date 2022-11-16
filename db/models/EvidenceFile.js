module.exports = {
  identity: 'evidence_file',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    activity: {
      columnName: 'taskEvidenceId',
      model: 'task_evidence'
    },
    file: {
      columnName: 'fileId',
      model: 'file'
    }
  }
};
