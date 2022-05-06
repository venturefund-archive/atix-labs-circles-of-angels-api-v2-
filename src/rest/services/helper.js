/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

// TODO: this file should be deleted

const activityDaoBuilder = require('../dao/activityDao');
const activityFileDaoBuilder = require('../dao/activityFileDao');
const activityPhotoDaoBuilder = require('../dao/activityPhotoDao');
const answerDaoBuilder = require('../dao/answerDao');
const answerQuestionDaoBuilder = require('../dao/answerQuestionDao');
const configsDaoBuilder = require('../dao/configsDao');
const fileDaoBuilder = require('../dao/fileDao');
const milestoneBudgetStatusDaoBuilder = require('../dao/milestoneBudgetStatusDao');
const milestoneDaoBuilder = require('../dao/milestoneDao');
const oracleActivityDaoBuilder = require('../dao/oracleActivityDao');
const photoDaoBuilder = require('../dao/photoDao');
const projectDaoBuilder = require('../dao/projectDao');
const projectStatusDaoBuilder = require('../dao/projectStatusDao');
const questionDaoBuilder = require('../dao/questionDao');
const transferDaoBuilder = require('../dao/transferDao');
const userDaoBuilder = require('../dao/userDao');
const userFunderDaoBuilder = require('../dao/userFunderDao');
const userProjectDaoBuilder = require('../dao/userProjectDao');
const userSocialEntrepreneurDaoBuilder = require('../dao/userSocialEntrepreneurDao');
const projectExperienceDaoBuilder = require('../dao/projectExperienceDao');
const blockchainBlockDaoBuilder = require('../dao/blockchainBlockDao');
const transactionDaoBuilder = require('../dao/transactionDao');

const helperBuilder = async fastify => {
  const { models } = fastify;
  const blockchainBlockDao = blockchainBlockDaoBuilder(models.blockchain_block);
  const configsDao = configsDaoBuilder({ configsModel: models.configs });
  const fileDao = fileDaoBuilder(models.file);
  const photoDao = photoDaoBuilder(models.photo);
  const userDao = userDaoBuilder({ userModel: models.user });
  const activityDao = activityDaoBuilder(models.activity);
  const activityFileDao = activityFileDaoBuilder(models.activity_file);
  const activityPhotoDao = activityPhotoDaoBuilder(models.activity_photo);
  const oracleActivityDao = oracleActivityDaoBuilder(models.oracle_activity);
  const projectExperienceDao = projectExperienceDaoBuilder(
    models.project_experience
  );
  const answerQuestionDao = answerQuestionDaoBuilder(models.answer_question);
  const answerDao = answerDaoBuilder(models.answer);
  const questionDao = questionDaoBuilder(models.question);
  const userFunderDao = userFunderDaoBuilder(models.user_funder);
  const userSocialEntrepreneurDao = userSocialEntrepreneurDaoBuilder(
    models.user_social_entrepreneur
  );
  const milestoneDao = milestoneDaoBuilder(models.milestone);
  const milestoneBudgetStatusDao = milestoneBudgetStatusDaoBuilder(
    models.milestone_budget_status
  );
  const transferDao = transferDaoBuilder({
    transferModel: models.fund_transfer,
    transferStatusModel: models.transfer_status
  });
  const projectDao = projectDaoBuilder({
    projectModel: models.project,
    userDao
  });
  const projectStatusDao = projectStatusDaoBuilder({
    projectStatusModel: models.project_status
  });
  const userProjectDao = userProjectDaoBuilder(models.user_project);

  const transactionDao = transactionDaoBuilder(fastify.models.transaction);

  exports.helper = {
    services: {
      projectService: undefined,
      questionnaireService: undefined
    },
    daos: {
      activityDao,
      activityFileDao,
      activityPhotoDao,
      answerDao,
      answerQuestionDao,
      configsDao,
      fileDao,
      milestoneBudgetStatusDao,
      milestoneDao,
      oracleActivityDao,
      photoDao,
      projectDao,
      projectStatusDao,
      questionDao,
      transferDao,
      userDao,
      userFunderDao,
      userProjectDao,
      userSocialEntrepreneurDao,
      projectExperienceDao,
      blockchainBlockDao,
      transactionDao
    }
  };
};

exports.helperBuilder = helperBuilder;
