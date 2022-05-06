/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents the relationship between an activity and its file evidences
 * @attribute `activity`: activity id
 * @attribute `file`: file evidence id
 */
module.exports = {
  identity: 'activity_file',
  primaryKey: 'id',
  attributes: {
    activity: {
      columnName: 'taskId',
      model: 'task'
    },
    file: {
      columnName: 'fileId',
      model: 'file'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    fileHash: { type: 'string', required: false }
  }
};
