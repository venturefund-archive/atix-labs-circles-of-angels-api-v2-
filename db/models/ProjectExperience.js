/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents a COA user experience with a project,
 * requires a comment and may have an attached file
 * @attribute `id`: unique identifier
 * @attribute `project`: reference to the related project
 * @attribute `user`: reference to the related user
 * @attribute `photos`: reference to the attached files
 * @attribute `comment`: comments from the user
 */
module.exports = {
  identity: 'project_experience',
  primaryKey: 'id',
  attributes: {
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    user: {
      columnName: 'userId',
      model: 'user'
    },
    photos: {
      collection: 'project_experience_photo',
      via: 'projectExperience' // TODO VALIDATE THIS
    },
    // projectId: { type: 'number' },
    // userId: { type: 'number' },
    comment: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
