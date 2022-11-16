module.exports = {
  identity: 'evidence_file',
  primaryKey: 'id',
  attributes: {
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    evidence: {
      columnName: 'taskEvidenceId',
      model: 'task_evidence'
    },
    file: {
      columnName: 'fileId',
      model: 'file'
    }
  }
};
