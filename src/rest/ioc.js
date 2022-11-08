/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones
 * agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const mailService = require('./services/mailService');
const userService = require('./services/userService');
const projectService = require('./services/projectService');
const countryService = require('./services/countryService');
const photoService = require('./services/photoService');
const fileService = require('./services/fileService');
const activityService = require('./services/activityService');
const projectExperienceService = require('./services/projectExperienceService');
const userProjectService = require('./services/userProjectService');
const transferService = require('./services/transferService');
const milestoneService = require('./services/milestoneService');
const daoService = require('./services/daoService');
const transactionService = require('./services/transactionService');
const balanceService = require('./services/balancesService');

const projectStatusValidators = require('./services/helpers/projectStatusValidators/validators');
const cronjobService = require('./services/cronjob/cronjobService');
const emailClient = require('./services/helpers/emailClient');

const milestoneBudgetStatusDao = require('./dao/milestoneBudgetStatusDao');
const projectDao = require('./dao/projectDao');
const followerDao = require('./dao/followerDao');
const oracleDao = require('./dao/oracleDao');
const funderDao = require('./dao/funderDao');
const countryDao = require('./dao/countryDao');
const photoDao = require('./dao/photoDao');
const fileDao = require('./dao/fileDao');
const projectExperienceDao = require('./dao/projectExperienceDao');
const activityDao = require('./dao/activityDao');
const userProjectDao = require('./dao/userProjectDao');
const transferDao = require('./dao/transferDao');
const milestoneDao = require('./dao/milestoneDao');
const userDao = require('./dao/userDao');
const passRecoveryService = require('./services/passRecoveryService');
const passRecoveryDao = require('./dao/passRecoveryDao');
const projectExperiencePhotoDao = require('./dao/projectExperiencePhotoDao');
const featuredProjectDao = require('./dao/featuredProjectDao');
const taskEvidenceDao = require('./dao/taskEvidenceDao');
const proposalDao = require('./dao/proposalDao');
const voteDao = require('./dao/voteDao');
const transactionDao = require('./dao/transactionDao');
const userWalletDao = require('./dao/userWalletDao');
const roleDao = require('./dao/roleDao');

const { injectDependencies } = require('./util/injection');

module.exports = fastify => {
  // Injects a model into a dao instance as the property `model`
  const injectModel = (daoInstance, model) => {
    injectDependencies(daoInstance, { model });
  };

  function configureFileService(service) {
    const dependencies = {
      fileDao
    };

    injectDependencies(service, dependencies);
  }

  // Configure the mail service.
  function configureMailService(service) {
    const dependencies = {
      emailClient
    };

    injectDependencies(service, dependencies);
  }

  function configureUserService(service) {
    const dependencies = {
      userDao,
      userWalletDao,
      mailService,
      projectService,
      countryService,
      daoService,
      userProjectDao,
      passRecoveryDao
    };

    injectDependencies(service, dependencies);
  }

  function configureCountryService(service) {
    const dependencies = {
      countryDao
    };

    injectDependencies(service, dependencies);
  }

  function configureProjectService(service) {
    const dependencies = {
      fileServer: fastify.configs.fileServer,
      projectDao,
      followerDao,
      oracleDao,
      funderDao,
      featuredProjectDao, // TODO: remove this once deleted
      milestoneService,
      userService,
      activityService,
      transferService,
      cronjobService,
      mailService,
      userProjectDao,
      roleDao,
      userDao
    };

    injectDependencies(service, dependencies);
  }

  function configureActivityService(service) {
    const dependencies = {
      activityDao,
      taskEvidenceDao,
      userProjectDao,
      roleDao,
      fileService: undefined,
      photoService: undefined,
      activityFileDao: undefined,
      activityPhotoDao: undefined,
      oracleActivityDao: undefined,
      userService,
      milestoneService,
      projectService,
      transactionService
    };
    injectDependencies(service, dependencies);
  }

  function configureUserProjectService(service) {
    const dependencies = {
      userProjectDao,
      userDao,
      roleDao,
      projectDao
    };

    injectDependencies(service, dependencies);
  }

  function configureTransferService(service) {
    const dependencies = {
      transferDao,
      projectService,
      userService,
      transactionService
    };

    injectDependencies(service, dependencies);
  }

  function configurePhotoService(service) {
    const dependencies = { photoDao };
    injectDependencies(service, dependencies);
  }

  function configurePassRecoveryService(service) {
    const dependencies = {
      mailService,
      passRecoveryDao,
      userDao,
      userWalletDao,
      userProjectDao,
      projectDao
    };
    injectDependencies(service, dependencies);
  }

  function configureMilestoneService(service) {
    const dependencies = {
      milestoneDao,
      activityService,
      milestoneBudgetStatusDao,
      projectService,
      userService
    };
    injectDependencies(service, dependencies);
  }

  function configureProjectExperienceService(service) {
    const dependencies = {
      projectExperienceDao,
      projectExperiencePhotoDao,
      projectService,
      userService
    };
    injectDependencies(service, dependencies);
  }

  function configureDaoService(service) {
    const dependencies = {
      userService,
      transactionService,
      proposalDao,
      voteDao
    };
    injectDependencies(service, dependencies);
  }

  function configureProjectStatusValidators(service) {
    const dependencies = {
      projectService,
      transferService,
      milestoneService
    };
    injectDependencies(service, dependencies);
  }

  function configureCronjobService(service) {
    const dependencies = {
      projectService,
      transferService,
      activityService,
      daoService,
      balanceService,
      mailService
    };
    injectDependencies(service, dependencies);
  }

  function configureTransactionService(service) {
    const dependencies = {
      userService,
      transactionDao
    };
    injectDependencies(service, dependencies);
  }

  function configureBalanceService(service) {
    const dependencies = {
      mailService
    };
    injectDependencies(service, dependencies);
  }

  function configureDAOs(models) {
    injectModel(userDao, models.user);
    injectModel(photoDao, models.photo);
    injectModel(fileDao, models.file);
    injectModel(milestoneDao, models.milestone);
    injectModel(projectDao, models.project);
    injectModel(followerDao, models.project_follower);
    injectModel(oracleDao, models.project_oracle);
    injectModel(funderDao, models.project_funder);
    injectModel(countryDao, models.country);
    injectModel(milestoneBudgetStatusDao, models.milestoneBudgetStatus);
    injectModel(passRecoveryDao, models.pass_recovery);
    injectModel(activityDao, models.task);
    injectModel(projectExperienceDao, models.project_experience);
    injectModel(projectExperiencePhotoDao, models.project_experience_photo);
    injectModel(transferDao, models.fund_transfer);
    // TODO: delete this when dao and model deleted
    injectModel(featuredProjectDao, models.featured_project);
    injectModel(taskEvidenceDao, models.task_evidence);
    injectModel(transactionDao, models.transaction);
    injectModel(proposalDao, models.proposal);
    injectModel(voteDao, models.vote);
    injectModel(userWalletDao, models.user_wallet);
    injectModel(userProjectDao, models.user_project);
    injectModel(roleDao, models.role);
  }

  function configureServices() {
    configureMailService(mailService);
    configureUserProjectService(userProjectService);
    configureUserService(userService);
    configureCountryService(countryService);
    configureMilestoneService(milestoneService);
    configureProjectService(projectService);
    configurePhotoService(photoService);
    configureFileService(fileService);
    configureActivityService(activityService);
    configureTransferService(transferService);
    configurePassRecoveryService(passRecoveryService);
    configureProjectExperienceService(projectExperienceService);
    configureDaoService(daoService);
    configureProjectStatusValidators(projectStatusValidators);
    configureCronjobService(cronjobService);
    configureTransactionService(transactionService);
    configureBalanceService(balanceService);
  }

  function init({ models }) {
    configureDAOs(models);
    configureServices();
  }

  init(fastify);
};
