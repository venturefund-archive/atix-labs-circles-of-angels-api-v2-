/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'photo',
  primaryKey: 'id',
  attributes: {
    path: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    projectExperience: {
      columnName: 'projectExperienceId',
      model: 'project_experience'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
