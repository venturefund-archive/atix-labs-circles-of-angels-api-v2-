/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const config = require('config');
const path = require('path');
const { uniqWith, unionBy, isEmpty, pick, omit } = require('lodash');
const { coa } = require('hardhat');
const { sha3 } = require('../util/hash');
const {
  projectStatuses,
  userRoles,
  supporterRoles,
  publicProjectStatuses,
  txFunderStatus,
  projectSensitiveDataFields,
  projectPublicFields,
  rolesTypes,
  currencyTypes,
  evidenceStatus,
  ACTION_TYPE,
  TIMEFRAME_DECIMALS,
  projectStatusToClone,
  MILESTONE_STATUS,
  PROJECT_STEPS,
  PROJECT_TYPES,
  ACTIVITY_TYPES
} = require('../util/constants');
const files = require('../util/files');
const storage = require('../util/storage');
const {
  validateExistence,
  validateParams
} = require('./helpers/projectServiceHelper');
const checkExistence = require('./helpers/checkExistence');
const { completeStep } = require('./helpers/dataCompleteUtil');
const { getMessageHash } = require('./helpers/hardhatTaskHelpers');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const validateOwnership = require('./helpers/validateOwnership');
const validateStatusToUpdate = require('./helpers/validateStatusToUpdate');
const validateUserCanEditProject = require('./helpers/validateUserCanEditProject');
const validateFile = require('./helpers/validateFile');
const validateTimeframe = require('./helpers/validateTimeframe');
const validateUsersAreEqualsOrThrowError = require('./helpers/validateUsersAreEqualsOrThrowError');
const mapFieldAndSum = require('./helpers/mapFieldAndSum');
const {
  buildTxURL,
  buildAddressURL,
  buildBlockURL
} = require('./helpers/txExplorerHelper');
const validateProjectStatusChange = require('./helpers/validateProjectStatusChange');
const projectStatusChangeEmailHelper = require('./helpers/mail/projectStatusChange');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const {
  secondsToDays,
  getStartOfDay,
  getDaysPassed,
  getSecondsPassed
} = require('../util/dateFormatters');
const { format } = require('../util/emailFormatter');

const thumbnailType = files.TYPES.thumbnail;
const coverPhotoType = files.TYPES.coverPhoto;
const milestonesType = files.TYPES.milestones;
const legalAgreementFileType = files.TYPES.agreementFile;
const projectProposalFileType = files.TYPES.agreementFile;

const STEPS_COMPLETED = 11;
const { currentWorkingDir, getFileFromPath } = files;

module.exports = {
  async getProjectById(id) {
    logger.info('[ProjectService] :: Entering getProjectById method');
    const project = await checkExistence(this.projectDao, id, 'project');
    logger.info(`[ProjectService] :: Project id ${project.id} found`);
    return project;
  },

  async updateProject(projectId, fields) {
    logger.info('[ProjectService] :: Entering updateProject method.');
    let toUpdate = { ...fields };
    if (fields.status) {
      toUpdate = { ...fields, lastUpdatedStatusAt: new Date() };
    }
    logger.info(
      `[ProjectService] :: Updating project id ${projectId}`,
      toUpdate
    );
    const updatedProject = await this.projectDao.updateProject(
      toUpdate,
      projectId
    );
    if (!updatedProject) {
      logger.error('[ProjectService] :: Error updating project in DB');
      throw new COAError(errors.project.CantUpdateProject(projectId));
    }
    return updatedProject.id;
  },

  async saveProject(project) {
    const savedProject = await this.projectDao.saveProject(project);
    if (!savedProject) {
      logger.error('[ProjectService] :: Error saving project in DB');
      throw new COAError(errors.project.CantSaveProject);
    }
    return savedProject;
  },

  async createProject({ ownerId }) {
    logger.info('[ProjectService] :: Entering createProject method');

    const user = await this.userService.getUserById(ownerId);

    if (!isEmpty(user)) {
      logger.info('[ProjectService] :: Saving new project');
      const project = await this.saveProject({
        projectName: 'Untitled',
        owner: ownerId
      });

      const projectId = project.id;

      logger.info(
        `[ProjectService] :: New project created with id ${projectId}`
      );

      logger.info('[ProjectService] :: About to create changelog');
      await this.changelogService.createChangelog({
        project: project.parent ? project.parent : projectId,
        revision: project.revision,
        action: ACTION_TYPE.CREATE_PROJECT,
        user: ownerId
      });
      return { projectId };
    }
    logger.error(
      `[ProjectService] :: Undefined user for provided ownerId: ${ownerId}`
    );
    throw new COAError(errors.user.UndefinedUserForOwnerId(ownerId));
  },

  async cloneProject({ userId, projectId }) {
    const project = await checkExistence(this.projectDao, projectId, 'project');
    if (project.parent) {
      logger.error('[ProjectService] :: Project is not genesis');
      throw new COAError(errors.project.ProjectNotGenesis);
    }

    await this.userProjectService.getUserProjectFromRoleDescription({
      projectId,
      roleDescriptions: [rolesTypes.BENEFICIARY, rolesTypes.FUNDER],
      userId
    });

    if (!projectStatusToClone.includes(project.status)) {
      logger.error(
        `[ProjectService] :: Project with status ${
          project.status
        } is not available to get cloned`
      );
      throw new COAError(errors.project.ProjectInvalidStatus(projectId));
    }

    const activeClone = await this.projectDao.findActiveProjectClone(projectId);
    if (activeClone) {
      throw new COAError(errors.project.CloneAlreadyExists(projectId));
    }

    logger.info('[ProjectService] :: Getting last review with valid status');
    const {
      id,
      ...lastProject
    } = await this.projectDao.getLastProjectWithValidStatus(projectId);
    const projectToClone = {
      ...lastProject,
      revision: lastProject.revision + 1,
      parent: projectId,
      status: projectStatuses.OPEN_REVIEW,
      step: 0
    };
    logger.info('[ProjectService] :: About to clone project');
    const clonedProject = await this.projectDao.saveProject(projectToClone);
    logger.info('[ProjectService] :: Getting milestones');
    const milestones = await this.milestoneDao.getMilestonesByProjectId(
      projectId
    );
    logger.info(
      '[ProjectService] :: About to clone milestones, activities and evidences'
    );
    await this.cloneMilestoneActivitiesAndEvidences({
      projectId: clonedProject.id,
      milestones
    });

    logger.info('[ProjectService] :: Getting user projects');
    const userProjects = await this.userProjectDao.getUserProject({
      project: projectId
    });

    logger.info('[ProjectService] :: About to clone user projects');
    await Promise.all(
      userProjects.map(({ id: userProjectId, ...userProject }) =>
        this.userProjectDao.createUserProject({
          ...userProject,
          project: clonedProject.id
        })
      )
    );

    logger.info('[ProjectService] :: About to insert changelog');
    await this.changelogService.createChangelog({
      project: project.parent ? project.parent : project.id,
      user: userId,
      revision: lastProject.revision + 1,
      action: ACTION_TYPE.PROJECT_CLONE
    });

    const toReturn = { projectId: clonedProject.id };
    return toReturn;
  },

  async cloneMilestoneActivitiesAndEvidences({ projectId, milestones }) {
    return Promise.all(
      milestones.map(async ({ id: milestoneId, tasks, ...milestone }) => {
        const newMilestone = await this.milestoneDao.createMilestone({
          ...milestone,
          project: projectId
        });
        await Promise.all(
          tasks.map(async ({ id: taskId, ...task }) => {
            const newTask = await this.activityDao.createActivity({
              ...task,
              milestone: newMilestone.id
            });
            const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(
              taskId
            );
            await Promise.all(
              evidences.map(async ({ id: evidenceId, ...evidence }) => {
                const newEvidence = await this.taskEvidenceDao.addTaskEvidence({
                  ...evidence,
                  activity: newTask.id
                });
                const evidenceFiles = await this.evidenceFileDao.getEvidenceFilesByEvidenceId(
                  evidenceId
                );
                await Promise.all(
                  evidenceFiles.map(({ id: evidenceFileId, ...evidenceFile }) =>
                    this.evidenceFileDao.saveEvidenceFile({
                      ...evidenceFile,
                      evidence: newEvidence.id
                    })
                  )
                );
              })
            );
          })
        );
      })
    );
  },

  async updateBasicProjectInformation({
    projectId,
    projectName,
    location,
    timeframe,
    timeframeUnit,
    file,
    user
  }) {
    const userId = user.id;
    logger.info(
      '[ProjectService] :: Entering updateBasicProjectInformation method'
    );
    validateRequiredParams({
      method: 'updateBasicProjectInformation',
      params: {
        projectId,
        projectName,
        location,
        timeframe,
        timeframeUnit
      }
    });

    const project = await checkExistence(this.projectDao, projectId, 'project');

    await validateUserCanEditProject({
      user,
      project,
      error: errors.project.ProjectCantBeUpdated
    });

    validateTimeframe(timeframe);

    validateFile({
      filePathOrHash: project.cardPhotoPath,
      fileParam: file,
      paramName: 'thumbnailPhoto',
      method: 'updateBasicProjectInformation',
      type: thumbnailType
    });

    let { cardPhotoPath } = project;

    if (file) {
      logger.info(`[ProjectService] :: Saving file of type '${thumbnailType}'`);
      cardPhotoPath = await files.saveFile(thumbnailType, file);
      logger.info(`[ProjectService] :: File saved to: ${cardPhotoPath}`);
    }

    logger.info('[ProjectService] :: Generating the new dataComplete value');

    const dataCompleteUpdated = completeStep({
      dataComplete: project.dataComplete,
      step: 1
    });

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const toUpdate =
      project.status === projectStatuses.DRAFT
        ? {
            projectName,
            location,
            timeframe,
            timeframeUnit,
            dataComplete: dataCompleteUpdated,
            cardPhotoPath
          }
        : {
            projectName,
            location,
            timeframe,
            cardPhotoPath
          };

    const updatedProjectId = await this.updateProject(projectId, toUpdate);
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);

    const fields = {
      projectName,
      location,
      timeframe: Number(timeframe).toFixed(TIMEFRAME_DECIMALS),
      timeframeUnit,
      dataComplete: dataCompleteUpdated
    };

    logger.info('[ProjectService] :: About to insert changelog');
    if (file) {
      await this.changelogService.createChangelog({
        project: projectId,
        revision: project.revision,
        user: userId,
        action: ACTION_TYPE.EDIT_PROJECT_BASIC_INFORMATION,
        extraData: { fieldName: 'thumbnailPhotoFile' }
      });
    }
    await this.compareFieldsAndCreateChangelog({
      project,
      fields,
      action: ACTION_TYPE.EDIT_PROJECT_BASIC_INFORMATION,
      user: userId
    });

    return { projectId: updatedProjectId };
  },

  async updateProjectDetails({
    projectId,
    mission,
    problemAddressed,
    currencyType,
    currency,
    additionalCurrencyInformation,
    legalAgreementFile,
    projectProposalFile,
    user,
    type
  }) {
    const userId = user.id;
    logger.info('[ProjectService] :: Entering updateProjectDetails method');
    validateRequiredParams({
      method: 'updateProjectDetails',
      params: {
        mission,
        problemAddressed,
        currencyType,
        currency,
        additionalCurrencyInformation,
        type
      }
    });

    const project = await checkExistence(this.projectDao, projectId, 'project');

    let { agreementFilePath, proposalFilePath } = project;

    await validateUserCanEditProject({
      user,
      project,
      error: errors.project.ProjectCantBeUpdated
    });

    this.validateProjectType(type);

    validateFile({
      filePathOrHash: agreementFilePath,
      fileParam: legalAgreementFile,
      paramName: 'legalAgreementFile',
      method: 'updateProjectDetails',
      type: legalAgreementFileType
    });
    validateFile({
      filePathOrHash: proposalFilePath,
      fileParam: projectProposalFile,
      paramName: 'projectProposalFile',
      method: 'updateProjectDetails',
      type: projectProposalFileType
    });

    if (legalAgreementFile) {
      logger.info('[ProjectService] :: Updating legal agreement file');
      agreementFilePath = await files.validateAndSaveFile(
        files.TYPES.agreementFile,
        legalAgreementFile
      );
    }
    if (projectProposalFile) {
      logger.info('[ProjectService] :: Updating project proposal file');
      proposalFilePath = await files.validateAndSaveFile(
        files.TYPES.proposalFile,
        projectProposalFile
      );
    }

    logger.info('[ProjectService] :: Generating the new dataComplete value');

    const dataCompleteUpdated = completeStep({
      dataComplete: project.dataComplete,
      step: 2
    });

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const toUpdate =
      project.status === projectStatuses.OPEN_REVIEW
        ? {
            mission,
            problemAddressed,
            agreementFilePath,
            proposalFilePath
          }
        : {
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            agreementFilePath,
            proposalFilePath,
            dataComplete: dataCompleteUpdated,
            type
          };

    const updatedProjectId = await this.updateProject(projectId, toUpdate);
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);

    logger.info('[ProjectService] :: About to insert changelog');
    await this.compareProjectDetailsFieldsAndCreateChangelog({
      project,
      mission,
      problemAddressed,
      currencyType,
      currency,
      additionalCurrencyInformation,
      legalAgreementFile,
      projectProposalFile,
      user: userId
    });

    return { projectId: updatedProjectId };
  },

  async compareProjectDetailsFieldsAndCreateChangelog({
    project,
    mission,
    problemAddressed,
    currencyType,
    currency,
    additionalCurrencyInformation,
    legalAgreementFile,
    projectProposalFile,
    user
  }) {
    logger.info(
      '[ProjectService] :: Entering compareProjectDetailsFieldsAndInsertChangelog method'
    );
    const projectId = project.parent ? project.parent : project.id;

    const fields = {
      mission,
      problemAddressed,
      currencyType,
      currency,
      additionalCurrencyInformation
    };

    await this.compareFieldsAndCreateChangelog({
      project,
      fields,
      action: ACTION_TYPE.EDIT_PROJECT_DETAILS,
      user
    });

    if (projectProposalFile) {
      await this.changelogService.createChangelog({
        project: projectId,
        revision: project.revision,
        user,
        action: ACTION_TYPE.EDIT_PROJECT_DETAILS,
        extraData: { fieldName: 'projectProposalFile' }
      });
    }
    if (legalAgreementFile) {
      await this.changelogService.createChangelog({
        project: projectId,
        revision: project.revision,
        user,
        action: ACTION_TYPE.EDIT_PROJECT_DETAILS,
        extraData: { fieldName: 'legalAgreementFile' }
      });
    }
  },

  async compareFieldsAndCreateChangelog({ project, fields, action, user }) {
    const projectId = project.parent ? project.parent : project.id;
    const fieldsChanged = Object.keys(fields).filter(
      key => project[key] !== fields[key]
    );

    await Promise.all(
      fieldsChanged.map(field =>
        this.changelogService.createChangelog({
          project: projectId,
          revision: project.revision,
          user,
          action,
          extraData: { fieldName: field }
        })
      )
    );
  },

  async createProjectThumbnail({
    projectName,
    location,
    timeframe,
    ownerId,
    file
  }) {
    logger.info('[ProjectService] :: Entering createProjectThumbnail method');
    validateRequiredParams({
      method: 'createProjectThumbnail',
      params: { projectName, location, timeframe, ownerId, file }
    });
    const user = await this.userService.getUserById(ownerId);

    if (!isEmpty(user)) {
      if (user.role !== userRoles.ENTREPRENEUR) {
        logger.error(
          `[ProjectService] :: User ${user.id} is not ${userRoles.ENTREPRENEUR}`
        );
        throw new COAError(errors.user.UnauthorizedUserRole(user.role));
      }

      validateMtype(thumbnailType, file);
      validatePhotoSize(file);

      logger.info(`[ProjectService] :: Saving file of type '${thumbnailType}'`);
      const cardPhotoPath = await files.saveFile(thumbnailType, file);
      logger.info(`[ProjectService] :: File saved to: ${cardPhotoPath}`);

      const project = {
        projectName,
        location,
        timeframe,
        goalAmount: 0,
        cardPhotoPath,
        owner: ownerId
      };

      logger.info(
        `[ProjectService] :: Saving project ${projectName} description`
      );
      const { id: projectId } = await this.saveProject(project);

      logger.info(
        `[ProjectService] :: New project created with id ${projectId}`
      );
      return { projectId };
    }
    logger.error(
      `[ProjectService] :: Undefined user for provided ownerId: ${ownerId}`
    );
    throw new COAError(errors.user.UndefinedUserForOwnerId(ownerId));
  },

  async updateProjectThumbnail(
    projectId,
    { projectName, location, timeframe, ownerId, file }
  ) {
    logger.info('[ProjectService] :: Entering updateProjectThumbnail method');
    validateRequiredParams({
      method: 'updateProjectThumbnail',
      params: { ownerId }
    });
    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    const { status } = project;
    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
    }

    let { cardPhotoPath } = project;

    if (file) {
      validateMtype(thumbnailType, file);
      validatePhotoSize(file);
      logger.info(`[ProjectService] :: Saving file of type '${thumbnailType}'`);
      cardPhotoPath = await files.saveFile(thumbnailType, file);
      logger.info(`[ProjectService] :: File saved to: ${cardPhotoPath}`);
    }

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const updatedProjectId = await this.updateProject(projectId, {
      projectName,
      location,
      timeframe,
      cardPhotoPath
    });
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);

    return { projectId: updatedProjectId };
  },

  async getProjectThumbnail(projectId) {
    logger.info('[ProjectService] :: Entering getProjectThumbnail method');
    validateRequiredParams({
      method: 'getProjectThumbnail',
      params: { projectId }
    });
    const {
      projectName,
      location,
      timeframe,
      goalAmount,
      cardPhotoPath
    } = await checkExistence(this.projectDao, projectId, 'project');
    logger.info(`[ProjectService] :: Project of id ${projectId} found`);
    return {
      projectName,
      location,
      timeframe,
      goalAmount,
      imgPath: cardPhotoPath
    };
  },

  async createProjectDetail(
    projectId,
    {
      mission,
      problemAddressed,
      coverPhoto,
      ownerId,
      agreementFile,
      proposalFile
    }
  ) {
    logger.info('[ProjectService] :: Entering createProjectDetail method');
    validateRequiredParams({
      method: 'createProjectDetail',
      params: { mission, problemAddressed, coverPhoto, ownerId, projectId }
    });

    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    logger.info('[ProjectService] :: Uploading cover photo');
    const coverPhotoPath = await files.validateAndSaveFile(
      coverPhotoType,
      coverPhoto
    );

    let agreementFileHash;
    let proposalFilePath;

    if (agreementFile) {
      logger.info('[ProjectService] :: Uploading agreement file');
      agreementFileHash = await storage.generateStorageHash(
        agreementFile,
        files.TYPES.agreementFile
      );
    }

    if (proposalFile) {
      logger.info('[ProjectService] :: Uploading proposal file');
      proposalFilePath = await files.validateAndSaveFile(
        files.TYPES.proposalFile,
        proposalFile
      );
    }

    const projectDetail = {
      mission,
      problemAddressed,
      coverPhotoPath,
      agreementFileHash,
      proposalFilePath
    };

    logger.info(
      `[ProjectService] :: Saving detail for project id ${projectId}`
    );
    const updatedProject = await this.updateProject(projectId, projectDetail);

    logger.info(
      `[ProjectService] :: New project created with id ${updatedProject}`
    );

    return {
      projectId: updatedProject
    };
  },

  async updateProjectDetail(
    projectId,
    {
      mission,
      problemAddressed,
      coverPhoto,
      ownerId,
      agreementFile,
      proposalFile
    }
  ) {
    logger.info('[ProjectService] :: Entering updateProjectDetail method');
    validateRequiredParams({
      method: 'updateProjectDetail',
      params: { ownerId }
    });

    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    validateOwnership(project.owner, ownerId);

    const { status } = project;
    if (status !== projectStatuses.NEW && status !== projectStatuses.REJECTED) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
    }

    let { coverPhotoPath, agreementFileHash, proposalFilePath } = project;

    if (coverPhoto) {
      logger.info('[ProjectService] :: Updating cover photo');
      coverPhotoPath = await files.validateAndSaveFile(
        files.TYPES.coverPhoto,
        coverPhoto
      );
    }
    if (agreementFile) {
      logger.info('[ProjectService] :: Updating agreement file');
      agreementFileHash = await storage.generateStorageHash(
        agreementFile,
        files.TYPES.agreementFile
      );
    }
    if (proposalFile) {
      logger.info('[ProjectService] :: Updating proposal file');
      proposalFilePath = await files.validateAndSaveFile(
        files.TYPES.proposalFile,
        proposalFile
      );
    }

    logger.info(`[ProjectService] :: Updating project of id ${projectId}`);

    const updatedProjectId = await this.updateProject(projectId, {
      mission,
      problemAddressed,
      coverPhotoPath,
      agreementFileHash,
      proposalFilePath
    });
    logger.info(`[ProjectService] :: Project of id ${projectId} updated`);
    return { projectId: updatedProjectId };
  },

  async getProjectDetail(projectId) {
    logger.info('[ProjectService] :: Entering getProjectDetail method');
    validateRequiredParams({
      method: 'getProjectDetail',
      params: { projectId }
    });
    const {
      mission,
      problemAddressed,
      coverPhotoPath
    } = await validateExistence(this.projectDao, projectId, 'project');
    logger.info(`[ProjectService] :: Project of id ${projectId} found`);
    return { mission, problemAddressed, imgPath: coverPhotoPath };
  },

  async updateProjectProposal(projectId, { proposal, ownerId }) {
    logger.info('[ProjectService] :: Entering updateProjectProposal method');
    validateRequiredParams({
      method: 'updateProjectProposal',
      params: { projectId, proposal, ownerId }
    });

    await this.userService.getUserById(ownerId);
    const project = await checkExistence(this.projectDao, projectId, 'project');
    const { owner, status } = project;
    validateOwnership(owner, ownerId);

    const allowedUpdateStatuses = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];

    if (!allowedUpdateStatuses.includes(status)) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(errors.project.ProjectCantBeUpdated(status));
    }

    logger.info(
      `[ProjectService] :: Saving proposal for project id ${projectId}`
    );
    const updatedProjectId = await this.updateProject(projectId, { proposal });
    logger.info(
      `[ProjectService] :: Proposal saved for project id ${updatedProjectId}`
    );
    return { projectId: updatedProjectId };
  },

  async getProjectProposal(projectId) {
    logger.info('[ProjectService] :: Entering getProjectProposal method');
    validateRequiredParams({
      method: 'getProjectProposal',
      params: { projectId }
    });
    const { proposal } = await checkExistence(
      this.projectDao,
      projectId,
      'project'
    );
    return { proposal };
  },

  async processMilestoneFile(projectId, { file, ownerId }) {
    logger.info('[ProjectService] :: Entering processMilestoneFile method');
    validateRequiredParams({
      method: 'processMilestoneFile',
      params: { projectId, ownerId, file }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');

    validateOwnership(project.owner, ownerId);
    // should we validate file size?
    validateMtype(milestonesType, file);

    const { status } = project;
    const allowedStatus = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];
    if (!allowedStatus.includes(status)) {
      logger.error(
        `[ProjectService] :: Status of project with id ${projectId} is not the correct for this action`
      );
      throw new COAError(
        errors.project.InvalidStatusForMilestoneFileProcess(status)
      );
    }

    if (project.milestonePath) {
      await this.milestoneService.removeMilestonesFromProject(project.id);
    }
    const milestones = await this.milestoneService.createMilestones(
      file,
      projectId
    );

    if (milestones.errors) {
      logger.info(
        '[ProjectService] :: Found errors while processing milestone file',
        milestones.errors
      );
      return {
        errors: milestones.errors
      };
    }

    const goalAmount = this.calculateGoalAmountFromMilestones(milestones);

    logger.info(`[ProjectService] :: Saving file of type '${milestonesType}'`);
    const milestonePath = await files.saveFile(milestonesType, file);
    logger.info(`[ProjectService] :: File saved to: ${milestonePath}`);

    const savedProjectId = await this.updateProject(projectId, {
      goalAmount,
      milestonePath
    });
    logger.info(
      `[ProjectService] :: Milestones of project ${savedProjectId} saved`
    );
    return { projectId: savedProjectId };
  },

  async getProjectMilestones(projectId) {
    logger.info('[ProjectService] :: Entering getProjectMilestones method');
    validateRequiredParams({
      method: 'getProjectMilestones',
      params: { projectId }
    });
    await checkExistence(this.projectDao, projectId, 'project');
    return this.milestoneService.getAllMilestonesByProject(projectId);
  },

  async getProjectMilestonesPath(projectId) {
    validateParams(projectId);
    await validateExistence(this.projectDao, projectId, 'project');

    logger.info(
      `[Project Routes] :: Getting milestones file of project ${projectId}`
    );

    const milestonesFilePath = await this.projectDao.getProjectMilestonesFilePath(
      projectId
    );

    if (!milestonesFilePath)
      throw new COAError(
        errors.project.ProjectDoesntHaveMilestonesFile(projectId)
      );

    const { milestonePath } = milestonesFilePath;
    logger.info('[Project Routes] :: MilestonesFilePath: ', milestonesFilePath);

    const milestonesFileExists = await files.fileExists(milestonePath);

    if (!milestonesFileExists)
      throw new COAError(
        errors.project.MilestonesFileNotFound(projectId, milestonePath)
      );

    const response = {
      filename: path.basename(milestonePath),
      filepath: milestonePath
    };

    logger.info(
      `[Project Routes] :: Milestones file of project ${projectId} got successfully`
    );

    return response;
  },

  async publishProject({ projectId, userId, previousStatus }) {
    logger.info('[ProjectService] :: Entering publishProject method');
    validateRequiredParams({
      method: 'publishProject',
      params: { projectId }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');
    logger.info(`[Project Service] :: Publish project ${projectId}`);

    if (!previousStatus) {
      validateStatusToUpdate({
        status: project.status,
        error: errors.project.ProjectIsNotPublishable
      });
    }

    this.validateDataComplete({ dataComplete: project.dataComplete });

    const users = await this.getUsersByProjectId({ projectId });
    this.validateProjectUsersAreVerified({ users });

    await this.validateProjectBudget(projectId);

    logger.info('[ProjectService] :: Reading agreement file');
    const agreementFile = getFileFromPath(
      `${currentWorkingDir}${project.agreementFilePath}`
    );
    logger.info('[ProjectService] :: Saving agreement file');
    const agreementFileHash = await this.storageService.saveStorageData({
      data: agreementFile
    });
    logger.info('[ProjectService] :: Reading proposal file');
    const proposalFile = files.getFileFromPath(
      `${currentWorkingDir}${project.proposalFilePath}`
    );
    logger.info('[ProjectService] :: Saving proposal file');
    const proposalFileHash = await this.storageService.saveStorageData({
      data: proposalFile
    });
    const projectMetadata = {
      name: project.projectName,
      mission: project.mission,
      problem: project.problemAddressed,
      users,
      agreementFileHash,
      proposalFileHash,
      milestones: project.milestones,
      revision: project.revision,
      type: project.type
    };
    logger.info(
      '[ProjectService] :: Saving project meetadata to storage service'
    );
    const metadataHash = await this.storageService.saveStorageData({
      data: JSON.stringify(projectMetadata)
    });
    logger.info('[ProjectService] :: Saving project metadata');
    await files.saveProjectMetadataFile({
      projectId: project.parent || project.id,
      revisionId: project.revision,
      data: { ...projectMetadata, hash: metadataHash }
    });
    try {
      logger.info(`[ProjectService] :: Updating project with id ${project.id}`);
      if (!previousStatus) {
        await this.updateProject(project.id, {
          status: projectStatuses.PUBLISHED,
          agreementFileHash,
          proposalFileHash,
          ipfsHash: metadataHash
        });
        logger.info(
          `[ProjectService] :: Calling COA createProject with ${JSON.stringify({
            projectId,
            metadataHash
          })}`
        );
        const transaction = await coa.createProject({
          projectId,
          metadataHash
        });

        logger.info('[ProjectService] :: About to create changelog');
        await this.changelogService.createChangelog({
          project: project.id,
          user: userId,
          revision: project.revision,
          action: ACTION_TYPE.PUBLISH_PROJECT,
          transaction: transaction.hash
        });
      }
    } catch (error) {
      logger.error(
        '[ProjectService] :: There was an error trying to update project',
        error
      );
      throw new COAError(errors.project.CantUpdateProject(project.id));
    }

    try {
      if (!project.parent) {
        logger.info('[ProjectService] :: About to send publish project emails');
        await this.mailService.sendEmails({
          project,
          action: ACTION_TYPE.PUBLISH_PROJECT,
          users
        });
      }
    } catch (error) {
      logger.error(
        '[ProjectService] :: There was an error trying to send publish project emails ',
        error
      );
      throw new COAError(errors.mail.EmailNotSent);
    }

    const toReturn = { projectId, ipfsHash: metadataHash };

    return toReturn;
  },

  validateDataComplete({ dataComplete }) {
    logger.info('[ProjectService] :: Entering validateDataComplete method');
    if (dataComplete !== STEPS_COMPLETED) {
      logger.info('[ProjectService] :: There are some incomplete step');
      throw new COAError(errors.project.IncompleteStep());
    }
  },

  validateProjectUsersAreVerified({ users }) {
    logger.info(
      '[ProjectService] :: Entering validateProjectUsersAreVerified method'
    );
    if (users.some(user => user.first)) {
      logger.info('[ProjectService] :: Not all users are verified');
      throw new COAError(errors.project.SomeUserIsNotVerified());
    }
  },

  async getUsersByProjectId({ projectId }) {
    logger.info('[ProjectService] :: Entering getUsersByProjectId method');

    const userIds = (await this.userProjectDao.getUserProject({
      select: ['user'],
      where: { project: projectId }
    })).map(({ user }) => user);

    return this.userDao.getUsersByIds([...new Set(userIds)]);
  },

  /**
   * Updates the status of a project to the specified status
   * if the transition is valid.
   * Returns the id of the updated project
   *
   * @param {*} user user requesting the change
   * @param {number} projectId project to update
   * @param {string} newStatus new project status
   */
  async updateProjectStatusOld(user, projectId, newStatus, rejectionReason) {
    logger.info('[ProjectService] :: Entering updateProjectStatus method');
    validateRequiredParams({
      method: 'updateProjectStatus',
      params: { projectId, user, newStatus }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');
    logger.info(
      `[Project Service] :: Updating project ${projectId} from ${
        project.status
      } to ${newStatus}`
    );
    await validateProjectStatusChange({
      user,
      newStatus,
      project
    });

    const toUpdate = { status: newStatus, rejectionReason: null };
    if (newStatus === projectStatuses.REJECTED) {
      if (!rejectionReason) {
        logger.error(
          `[ProjectService] :: RejectionReason is required to update project id ${projectId} to rejected`
        );
        throw new COAError(errors.project.RejectionReasonEmpty(projectId));
      }
      toUpdate.rejectionReason = rejectionReason;
    }
    if (newStatus === projectStatuses.EXECUTING) {
      await this.updateProjectAsExecuting(project);
    } else if (newStatus === projectStatuses.FUNDING) {
      await this.updateProjectAsfunding(project);
    } else {
      await this.updateProject(projectId, toUpdate);
    }
    const skipNotificationStatus = [
      projectStatuses.NEW,
      projectStatuses.TO_REVIEW,
      projectStatuses.DELETED
    ];
    // send email
    try {
      if (!skipNotificationStatus.includes(newStatus)) {
        await this.notifyProjectStatusChange(project, newStatus);
      }
    } catch (error) {
      logger.error(
        '[ProjectService] :: An error occurred sending the project status change email',
        error
      );
    }

    return { projectId };
  },

  async deleteProject(projectId) {
    const project = await checkExistence(this.projectDao, projectId, 'project');
    if (project.status !== projectStatuses.DRAFT) {
      logger.error(`Project with id ${projectId} is not in Draft status`);
      throw new COAError(errors.project.ProjectInvalidStatus(projectId));
    }
    const userProjects = await this.userProjectDao.getUserProjects(projectId);

    try {
      logger.info('[ProjectService] :: About to delete user projects');
      await Promise.all(
        userProjects.map(userProject =>
          this.userProjectDao.removeUserProject(userProject.id)
        )
      );
      const milestones = await this.milestoneService.getAllMilestonesByProject(
        projectId
      );
      logger.info(
        '[ProjectService] :: About to delete milestones and activities'
      );
      await Promise.all(
        milestones.map(async milestone => {
          await Promise.all(
            milestone.tasks.map(async task => {
              const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(
                task.id
              );
              await Promise.all(
                evidences.map(evidence =>
                  this.taskEvidenceDao.deleteEvidence(evidence.id)
                )
              );
              this.activityDao.deleteActivity(task.id);
            })
          );
          return this.milestoneDao.deleteMilestone(milestone.id);
        })
      );
      logger.info('[ProjectService] :: About to delete changelogs');
      await this.changelogService.deleteProjectChangelogs(projectId);
    } catch (error) {
      logger.error(
        '[ProjectService] :: There was an error deleting project ',
        error
      );
      throw new COAError(errors.server.InternalServerError);
    }
    logger.info(
      `[ProjectService] :: About to delete project with id ${projectId}`
    );
    const deletedProject = await this.projectDao.deleteProject({ projectId });
    if (!deletedProject) {
      logger.info('[ProjectService] :: Project could not be deleted');
      throw new COAError(errors.common.ErrorDeleting('project'));
    }
    logger.info('[ProjectService] :: Project successfully deleted');
    return deletedProject;
  },

  mapUserEmails(users) {
    return users
      ? users.map(eachRole => ({
          ...eachRole,
          users: eachRole.users.map(eachUser => ({
            ...eachUser,
            email: format(eachUser.email)
          }))
        }))
      : users;
  },

  /**
   * Sends an email to the owner and users that follow or have applied to the project
   * @param {{ id: number, projectName: string }} project project's data
   * @param {string} newStatus new status
   */
  async notifyProjectStatusChange(project, newStatus) {
    logger.info(
      '[ProjectService] :: Entering notifyProjectStatusChange method'
    );
    const { id, projectName } = project;
    const { owner, followers, funders, oracles } = await this.getProjectUsers(
      id
    );
    logger.info(
      '[ProjectService] :: Notifying project status change for project of id',
      id
    );
    if (owner) {
      await this.mailService.sendProjectStatusChangeMail({
        to: owner.email,
        bodyContent: projectStatusChangeEmailHelper.getBodyContent(
          { id, projectName },
          newStatus,
          'owner'
        )
      });
    }

    followers.forEach(async follower => {
      await this.mailService.sendProjectStatusChangeMail({
        to: follower.email,
        bodyContent: projectStatusChangeEmailHelper.getBodyContent(
          { id, projectName },
          newStatus,
          'follower'
        )
      });
    });

    const supporters = unionBy(oracles, funders, 'id');
    supporters.forEach(async supporter => {
      await this.mailService.sendProjectStatusChangeMail({
        to: supporter.email,
        bodyContent: projectStatusChangeEmailHelper.getBodyContent(
          { id, projectName },
          newStatus,
          'supporter'
        )
      });
    });
  },

  async getProject(id, user) {
    const checkProject = await checkExistence(this.projectDao, id, 'project');
    if (!checkProject.parent) {
      const project = await checkExistence(
        this.projectDao,
        id,
        'project',
        this.projectDao.getLastPublicRevisionProject(id)
      );
      if (!user) {
        const projectWithPublicFields = pick(project, projectPublicFields);

        return {
          ...projectWithPublicFields,
          users: this.mapUserEmails(projectWithPublicFields.users),
          milestones: projectWithPublicFields.milestones.map(milestone => ({
            ...milestone,
            activities: milestone.activities.map(activity => ({
              ...activity,
              evidences: activity.evidences.filter(
                evidence => evidence.status === evidenceStatus.APPROVED
              )
            }))
          }))
        };
      }
      // This is for the admin panel. The admin user can see full emails
      if (user.isAdmin) return project;
      const userProjects = await this.userProjectDao.getProjectsOfUser(user.id);
      const existsUserProjectRelationship = userProjects
        .map(up => up.project.id)
        .includes(id);
      if (!existsUserProjectRelationship) {
        logger.error(
          '[ProjectService] User not related to this project, throwing'
        );
        throw new COAError(errors.user.UserNotRelatedToTheProject);
      }
      project.users = this.mapUserEmails(project.users);
      if (project.status === projectStatuses.DRAFT)
        return {
          id: project.id,
          status: project.status,
          basicInformation: project.basicInformation,
          revision: project.revision
        };
      return omit(project, projectSensitiveDataFields);
    }

    if (!user) {
      throw new COAError(errors.user.UserCanNotAccessInformation);
    }

    if (!user.isAdmin) {
      await this.userProjectService.validateUserWithRoleInProject({
        user: user.id,
        descriptionRoles: [rolesTypes.BENEFICIARY, rolesTypes.FUNDER],
        project: id,
        error: errors.user.UserCanNotAccessInformation
      });
    }

    const project = await checkExistence(
      this.projectDao,
      id,
      'project',
      this.projectDao.getProjectWithAllData(id)
    );

    project.users = this.mapUserEmails(project.users);
    return project.status === projectStatuses.IN_REVIEW
      ? {
          ...project,
          toSign: getMessageHash(
            ['uint256', 'string', 'string'],
            [project.parent, project.ipfsHash, project.proposer.email]
          )
        }
      : project;
  },

  // TODO: check if this is being used. If not, remove.
  async getProjectFull(id) {
    const project = await this.getProject(id);
    project.milestones = await this.milestoneService.getAllMilestonesByProject(
      id
    );
    return project;
  },

  async getPublicProjects() {
    // TODO: implement pagination
    logger.info('[ProjectService] :: Entering getPublicProjects method');
    return this.projectDao.findAllByProps({
      status: { in: Object.values(publicProjectStatuses) }
    });
  },

  async getProjects({ status } = {}) {
    // TODO: implement pagination
    logger.info(
      `Getting all the projects ${status ? `with status ${status}` : ''}`
    );
    const genesisProjects = await this.projectDao.findGenesisProjects();
    const projects = await Promise.all(
      genesisProjects.map(project =>
        this.projectDao.getLastValidReview(project.id)
      )
    );

    const beneficiaryRole = await this.roleService.getRoleByDescription(
      rolesTypes.BENEFICIARY
    );
    const projectsWithBeneficiary = await Promise.all(
      projects.map(async project => {
        const beneficiary = await this.userProjectService.getBeneficiaryByProjectId(
          {
            projectId: project.id,
            role: beneficiaryRole
          }
        );
        if (beneficiary) {
          const projectWithBeneficiary = { ...project, beneficiary };
          return projectWithBeneficiary;
        }
        return project;
      })
    );
    return projectsWithBeneficiary;
  },

  async getProjectsWithTransfers() {
    // TODO: implement pagination
    logger.info(
      '[ProjectService] :: Getting all the projects with at least one transfer'
    );
    return this.projectDao.findProjectsWithTransfers();
  },

  /**
   * Returns the projects that belong to the specified user
   *
   * @param {number} ownerId
   * @returns {object[]} array of projects
   */
  async getProjectsByOwner(ownerId) {
    // TODO: implement pagination
    logger.info('[ProjectService] :: Entering getProjectsByOwner method');

    const filters = {
      where: { status: { '!=': projectStatuses.DELETED }, owner: ownerId },
      sort: 'id DESC'
    };

    return this.projectDao.findAllByProps(filters);
  },

  /**
   * Returns a JSON object containing the description and
   * information of milestones, tasks and funders of a project
   *
   * @param {number} projectId
   * @returns {Promise<string>} agreement in JSON format
   */
  async generateProjectAgreement(projectId) {
    logger.info('[ProjectService] :: Entering generateProjectAgreement method');
    logger.info(`[ProjectService] :: Looking up project of id ${projectId}`);
    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { owner: true }
    );
    if (!project) {
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const milestonesWithTasks = await this.milestoneService.getAllMilestonesByProject(
      projectId
    );

    const milestones = milestonesWithTasks.map(milestone => {
      const { description } = milestone;
      const goal = milestone.tasks.reduce(
        (total, task) => total + Number(task.budget),
        0
      );
      const tasks = milestone.tasks.map(task => ({
        // TODO: define task fields
        id: sha3(projectId, task.oracle, task.id),
        oracle: task.oracle,
        description: task.description,
        reviewCriteria: task.reviewCriteria,
        category: task.category,
        keyPersonnel: task.keyPersonnel
      }));

      return {
        description,
        goal,
        tasks
      };
    });

    const transfersWithSender = await this.transferService.getAllTransfersByProps(
      {
        filters: { project: projectId, status: txFunderStatus.VERIFIED },
        populate: { sender: true }
      }
    );
    const funders = uniqWith(
      transfersWithSender.map(transfer => transfer.sender),
      (a, b) => a.id === b.id
    ).map(funder => ({
      // TODO: define funder fields
      firstName: funder.firstName,
      lastName: funder.lastName,
      email: funder.email,
      address: funder.address
    }));

    const projectOwner = {
      firstName: project.owner.firstName,
      lastName: project.owner.lastName,
      email: project.owner.email,
      address: project.owner.address
    };

    // TODO: define project fields
    const agreement = {
      name: project.projectName,
      mission: project.mission,
      problem: project.problemAddressed,
      owner: projectOwner,
      milestones,
      funders
    };

    const agreementJson = JSON.stringify(agreement, undefined);
    return agreementJson;
  },

  /**
   * Returns an object with all users related to the project
   * (Owner, followers, funders, oracles)
   * @param {number} projectId
   * @returns {{owner: User, followers: User[], funders: User[], oracles: User[]}}
   */
  async getProjectUsers(projectId) {
    logger.info('[ProjectService] :: Entering getProjectUsers method');
    validateRequiredParams({
      method: 'getProjectUsers',
      params: { projectId }
    });

    const projectWithUsers = await this.projectDao.findProjectWithUsersById(
      projectId
    );

    if (!projectWithUsers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    return {
      owner: projectWithUsers.owner,
      followers: projectWithUsers.followers || [],
      funders: projectWithUsers.funders || [],
      oracles: projectWithUsers.oracles || []
    };
  },

  /**
   * Following of a project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns projectId || error
   */
  async followProject({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering followProject method');
    validateRequiredParams({
      method: 'followProject',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status, followers } = projectWithFollowers;

    const allowFollow = Object.values(publicProjectStatuses).includes(status);

    if (!allowFollow) {
      logger.error(
        `[ProjectService] :: Project ${projectId} has't been published yet`
      );
      throw new COAError(errors.project.CantFollowProject(projectId));
    }

    const alreadyFollowing = followers.some(follower => follower.id === userId);

    if (alreadyFollowing) {
      logger.error('[ProjectService] :: User already  follow this project');
      throw new COAError(errors.project.AlreadyProjectFollower());
    }

    const followerCreated = await this.followerDao.saveFollower({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} following project ${projectId}`
    );

    return { projectId: followerCreated.projectId };
  },

  /**
   * Unfollowing of a project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns projectId || error
   */
  async unfollowProject({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering unfollowProject method');
    validateRequiredParams({
      method: 'unfollowProject',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status, followers } = projectWithFollowers;

    const allowUnfollow = Object.values(publicProjectStatuses).includes(status);

    if (!allowUnfollow) {
      logger.error(
        `[ProjectService] :: Project ${projectId} has't been published yet`
      );
      throw new COAError(errors.project.CantFollowProject(projectId));
    }

    const isFollowing = followers.some(follower => follower.id === userId);

    if (!isFollowing) {
      logger.error('[ProjectService] :: User is not following this project');
      throw new COAError(errors.project.IsNotFollower());
    }

    const followerDeleted = await this.followerDao.deleteFollower({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} unfollowed project ${projectId}`
    );

    return { projectId: followerDeleted.projectId };
  },

  /**
   * Check if user is following the specific project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isFollower({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering isFollower method');
    validateRequiredParams({
      method: 'isFollower',
      params: { projectId, userId }
    });

    const projectWithFollowers = await this.projectDao.findOneByProps(
      { id: projectId },
      { followers: true }
    );

    if (!projectWithFollowers) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { followers } = projectWithFollowers;

    const isFollowing = followers.some(follower => follower.id === userId);

    return isFollowing;
  },

  /**
   * Apply to a project as FUNDER or ORACLE
   *
   * @param {number} projectId
   * @param {number} userId
   * @param {string} role
   * @returns projectId || error
   */
  async applyToProject({ projectId, userId, role }) {
    logger.info('[ProjectService] :: Entering applyToProject method');
    validateRequiredParams({
      method: 'applyToProject',
      params: { projectId, userId, role }
    });

    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true, funders: true }
    );

    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const { status } = project;
    const { PUBLISHED, CONSENSUS, FUNDING } = projectStatuses;
    const allowedStatusesByRole = {
      oracles: [PUBLISHED, CONSENSUS],
      funders: [PUBLISHED, CONSENSUS, FUNDING]
    };

    if (!allowedStatusesByRole[role].includes(status)) {
      logger.error(
        `[ProjectService] :: It doesn't allow apply as ${role} when the project is in ${status} status`
      );
      throw new COAError(errors.project.CantApplyToProject(status));
    }

    const user = await this.userService.getUserById(userId);

    if (user.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(`[ProjectService] :: User ${userId} is not supporter`);
      throw new COAError(errors.user.UnauthorizedUserRole(user.role));
    }

    const alreadyApply = project[role].some(
      participant => participant.id === userId
    );

    if (alreadyApply) {
      logger.error(
        `[ProjectService] :: User already apply to ${role} in this project`
      );
      throw new COAError(errors.project.AlreadyApplyToProject(role));
    }

    const dao =
      role === supporterRoles.ORACLES ? this.oracleDao : this.funderDao;

    const candidateAdded = await dao.addCandidate({
      project: projectId,
      user: userId
    });

    logger.info(
      `[ProjectService] :: User ${userId} apply to ${role} into project ${projectId}`
    );

    return { candidateId: candidateAdded.id };
  },

  /**
   * Check if user already applied to the specific project
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isCandidate({ projectId, userId }) {
    logger.info('[ProjectService] :: Entering isCandidate method');
    validateRequiredParams({
      method: 'isCandidate',
      params: { projectId, userId }
    });

    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true, funders: true }
    );

    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    const alreadyApply = {};

    Object.values(supporterRoles).forEach(collection => {
      alreadyApply[collection] = project[collection].some(
        participant => participant.id === userId
      );
    });

    return alreadyApply;
  },

  /**
   * Check if user applied to the specific project as oracle
   *
   * @param {number} projectId
   * @param {number} userId
   * @returns boolean || error
   */
  async isOracleCandidate({ projectId, userId }) {
    // TODO: maybe somehow fuse this method with isCandidate?
    logger.info('[ProjectService] :: Entering isOracleCandidate method');
    validateRequiredParams({
      method: 'isOracleCandidate',
      params: { projectId, userId }
    });
    const project = await this.projectDao.findOneByProps(
      { id: projectId },
      { oracles: true }
    );
    if (!project) {
      logger.error(
        `[ProjectService] :: Project with id ${projectId} not found`
      );
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }
    const isOracle = !!project.oracles.find(oracle => oracle.id === userId);
    return isOracle;
  },

  /**
   * Returns a list of all projects marked as featured
   * @returns {Promise<[]>} featured projects
   */
  async getFeaturedProjects() {
    logger.info('[ProjectService] :: Entering getFeaturedProjects method');
    // TODO: this should be changed to get all projects in project table marked as featured
    const featuredProjects = await this.featuredProjectDao.findAllByProps(
      undefined,
      { project: true }
    );
    return featuredProjects.map(project => project.project);
  },

  /**
   * Transition all projects in `consensus` status to `funding`
   * if it meets all conditions or to `rejected` if not.
   *
   * @returns {Promise<Project[]>} list of updated projects
   */
  async transitionConsensusProjects(projectId) {
    logger.info(
      '[ProjectService] :: Entering transitionConsensusProjects method'
    );
    const projects = await this.projectDao.findAllByProps({
      id: projectId,
      status: projectStatuses.CONSENSUS
    });

    const updatedProjects = await Promise.all(
      projects.map(async project => {
        logger.info(
          '[ProjectService] :: Checking if consensus time has passed for project',
          project.id
        );
        const newStatus = await this.getNextValidStatus(
          project,
          projectStatuses.FUNDING,
          projectStatuses.REJECTED
        );
        if (
          newStatus === projectStatuses.REJECTED &&
          !this.hasTimePassed(project)
        ) {
          logger.info(
            `[ProjectService] :: Has no time passed for project ${project.id}`
          );
          return;
        }
        logger.info(
          `[Project Service] :: Updating project ${project.id} from ${
            project.status
          } to ${newStatus}`
        );

        if (newStatus === projectStatuses.REJECTED) {
          await this.updateProject(project.id, {
            status: newStatus
          });
          await this.notifyProjectStatusChange(project, newStatus);
        } else if (newStatus === projectStatuses.FUNDING) {
          await this.updateProjectAsfunding(project);
        }
        return { projectId: project.id, newStatus };
      })
    );
    return updatedProjects.filter(updated => !!updated);
  },

  /**
   * Transition all projects in `funding` status to `executing`
   * if it meets all conditions or to `consensus` if not.
   *
   * @returns {Promise<Project[]>} list of updated projects
   */
  async transitionFundingProjects(projectId) {
    logger.info(
      '[ProjectService] :: Entering transitionFundingProjects method'
    );
    const projects = await this.projectDao.findAllByProps(
      {
        id: projectId,
        status: projectStatuses.FUNDING
      },
      { funders: true }
    );

    const updatedProjects = await Promise.all(
      projects.map(async project => {
        logger.info(
          '[ProjectService] :: Checking if funding time has passed for project',
          project.id
        );
        const newStatus = await this.getNextValidStatus(
          project,
          projectStatuses.EXECUTING,
          projectStatuses.CONSENSUS
        );
        if (
          newStatus === projectStatuses.CONSENSUS &&
          !this.hasTimePassed(project)
        ) {
          logger.info(
            `[ProjectService] :: Has no time passed for project ${project.id}`
          );
          return;
        }
        logger.info(
          `[ProjectService] :: Updating project ${project.id} from ${
            project.status
          } to ${newStatus}`
        );

        if (newStatus === projectStatuses.CONSENSUS) {
          const removedFunders = await this.funderDao.deleteFundersByProject(
            project.id
          );
          if (!removedFunders) {
            logger.error(
              `[ProjectService] :: Cannot remove funders from project ${
                project.id
              }`
            );
            return;
          }
          await this.updateProject(project.id, {
            status: newStatus
          });
        } else if (newStatus === projectStatuses.EXECUTING) {
          await this.updateProjectAsExecuting(project);
        }
        await this.notifyProjectStatusChange(project, newStatus);
        return { projectId: project.id, newStatus };
      })
    );
    return updatedProjects.filter(updated => !!updated);
  },

  async updateProjectAsExecuting(project) {
    try {
      const agreement = await this.generateProjectAgreement(project.id);
      const agreementHash = await storage.generateStorageHash(agreement);
      logger.info(
        `[ProjectService] :: Saving agreement for project ${project.id}`
      );
      await this.updateProject(project.id, {
        agreementJson: agreement,
        status: projectStatuses.EXECUTING
      });

      const removedOracles = await this.removeOraclesWithoutActivitiesFromProject(
        project.id
      );
      logger.info(
        '[ProjectService] :: Oracles removed from project:',
        removedOracles
      );

      const removedFunders = await this.removeFundersWithNoTransfersFromProject(
        project
      );
      logger.info(
        '[ProjectService] :: Funders removed from project:',
        removedFunders
      );

      const milestones = await this.milestoneService.getAllMilestonesByProject(
        project.id
      );
      if (milestones && milestones.length && milestones[0]) {
        await this.milestoneService.setClaimable(milestones[0].id);
      }

      logger.info(
        `[ProjectService] :: Uploading agreement of project ${
          project.id
        } to blockchain`
      );
      await coa.addProjectAgreement(project.address, agreementHash);
    } catch (e) {
      throw e;
    }
  },

  async updateProjectAsfunding(project) {
    logger.info(
      `[ProjectService] :: Sending project ${project.id} to blockchain`
    );

    try {
      const tx = await coa.createProject(project.id, project.projectName);

      await this.updateProject(project.id, {
        txHash: tx.hash
      });
    } catch (error) {
      logger.info(
        `[ProjectService] :: Error when updating blockchain information for Project ${
          project.id
        }`,
        error
      );
      throw new COAError(errors.project.BlockchainWritingError(project.id));
    }
  },
  /**
   * Checks if the established time has passed
   * for the phase the project is currently in.
   *
   * Returns true or false whether the time has passed or not.
   * @param {*} project
   * @returns {boolean}
   */
  hasTimePassed(project) {
    logger.info('[ProjectService] :: Entering hasTimePassed method');
    try {
      validateRequiredParams({
        method: 'hasTimePassed',
        params: { project }
      });
      const { lastUpdatedStatusAt, status } = project;

      // TODO: couldn't think of a better way to do this,
      //       production needs to check by day, staging by seconds/minutes
      //       cron in production runs at midnight, in staging every few minutes
      const now =
        config.defaultProjectTimes.minimumUnit === 'days'
          ? getStartOfDay(new Date())
          : new Date();

      const last =
        config.defaultProjectTimes.minimumUnit === 'days'
          ? getStartOfDay(lastUpdatedStatusAt)
          : lastUpdatedStatusAt;

      const daysPassedSinceLastUpdate =
        config.defaultProjectTimes.minimumUnit === 'days'
          ? getDaysPassed(last, now)
          : getSecondsPassed(last, now);

      let phaseSeconds;

      // TODO: check time for published -> consensus phase
      if (status === projectStatuses.CONSENSUS) {
        phaseSeconds = project.consensusSeconds;
      } else if (status === projectStatuses.FUNDING) {
        phaseSeconds = project.fundingSeconds;
      } else {
        return false;
      }

      const phaseDuration =
        config.defaultProjectTimes.minimumUnit === 'days'
          ? secondsToDays(phaseSeconds)
          : phaseSeconds;
      return daysPassedSinceLastUpdate >= phaseDuration;
    } catch (error) {
      logger.error(
        '[ProjectService] :: An error occurred while checking if time has passed',
        error
      );
    }
    return false;
  },

  /**
   * Returns the next valid status of the project between two choices.
   *
   * One if the validation passes, the other if it fails.
   * @param {*} project
   * @param {string} successStatus status if validation passes
   * @param {string} failStatus status if validation fails
   * @returns {Promise<string>} new status
   */
  async getNextValidStatus(project, successStatus, failStatus) {
    logger.info('[ProjectService] :: Entering getNextValidStatus method');
    let newStatus = successStatus;
    try {
      await validateProjectStatusChange({
        user: project.owner,
        newStatus,
        project
      });
    } catch (error) {
      logger.error(
        `[Project Service] :: Validation to change project ${
          project.id
        } to ${successStatus} status failed `,
        error
      );
      newStatus = failStatus;
    }
    return newStatus;
  },

  /**
   * Removes all candidate funders
   * with no verified transfers from a project.a1
   *
   * Returns a list of the funders ids that were removed
   *
   * @param {{ id: number, funders: any[] }} project
   * @returns {Promise<number[]>} removed funders id's
   */
  async removeFundersWithNoTransfersFromProject(project) {
    logger.info(
      '[ProjectService] :: Entering removeFundersWithNoTransfersFromProject method'
    );
    const verifiedTransfers = await this.transferService.getAllTransfersByProps(
      {
        filters: { project: project.id, status: txFunderStatus.VERIFIED }
      }
    );
    const fundersWithTransfers = verifiedTransfers
      ? verifiedTransfers.map(transfer => transfer.sender)
      : [];
    const fundersWithNoTransfers = project.funders
      ? project.funders.filter(
          funder => !fundersWithTransfers.includes(funder.id)
        )
      : [];
    const removedFunders = await Promise.all(
      fundersWithNoTransfers.map(funder =>
        this.funderDao.deleteFundersByProject(project.id, { user: funder.id })
      )
    );

    return removedFunders
      ? removedFunders.filter(funder => !!funder).map(funder => funder.user)
      : [];
  },

  /**
   * Remove all candidates oracles
   * without Milestones' activities.
   *
   * Returns a list of users ids that were removed
   *
   * @param {number} projectId
   */
  async removeOraclesWithoutActivitiesFromProject(projectId) {
    logger.info(
      '[ProjectService] :: Entering removeOraclesWithoutActivitiesFromProject method'
    );
    const oraclesWithActivities = await this.getAllOraclesWithTasksFromProject(
      projectId
    );
    if (!oraclesWithActivities.length) {
      return [];
    }
    return this.oracleDao.removeCandidatesByProps({
      and: [{ project: projectId }, { user: { '!=': oraclesWithActivities } }]
    });
  },

  /**
   * Returns the address of an existing project in COA contract
   *
   * @param {number} projectId
   * @returns {Promise<string>} project address
   */
  async getAddress(projectId) {
    logger.info('[ProjectService] :: Entering getAddress method');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    logger.info(`[ProjectService] :: Project id ${project.id} found`);
    return project.address;
  },

  calculateGoalAmountFromMilestones(milestones) {
    logger.info(
      '[ProjectService] :: Entering calculateGoalAmountFromMilestones method'
    );
    const goalAmount = milestones
      .map(milestone =>
        milestone.tasks.reduce(
          (milestoneTotal, task) => milestoneTotal + Number(task.budget),
          0
        )
      )
      .reduce(
        (totalProject, milestoneBudget) => totalProject + milestoneBudget,
        0
      );
    return goalAmount;
  },

  /**
   * Returns the blockchain information for the specified project
   * @param {number} projectId
   */
  async getBlockchainData(projectId) {
    logger.info('[ProjectService] :: Entering getBlockchainInfo method');
    const project = await checkExistence(this.projectDao, projectId, 'project');

    const { address, txHash, agreementFileHash } = project;

    if (!txHash) {
      logger.info(
        `[ProjectService] :: Project ${projectId} does not have blockchain information`
      );
      throw new COAError(errors.project.BlockchainInfoNotFound(projectId));
    }

    logger.info(
      `[ProjectService] :: Getting transaction response for ${txHash}`
    );
    const txResponse = await coa.getTransactionResponse(txHash);
    // not sure if this is necessary
    if (!txResponse) {
      logger.info(
        `[ProjectService] :: Project ${projectId} does not have blockchain information`
      );
      throw new COAError(errors.project.BlockchainInfoNotFound(projectId));
    }
    const { blockNumber } = txResponse;
    let timestamp;
    const secondsConversion = 1000;
    if (blockNumber) {
      const block = await coa.getBlock(blockNumber);
      ({ timestamp } = block);
    }
    return {
      txHash,
      txHashUrl: txHash ? buildTxURL(txHash) : undefined,
      address,
      addressUrl: address ? buildAddressURL(address) : undefined,
      creationDate: timestamp
        ? new Date(timestamp * secondsConversion)
        : undefined,
      blockNumber,
      blockNumberUrl: blockNumber ? buildBlockURL(blockNumber) : undefined,
      agreement: agreementFileHash
    };
  },
  /**
   * Returns the oracles assigned at least one transfer
   * @param {number} project
   */
  async getAllOraclesWithTasksFromProject(project) {
    const oracles = [];
    const milestones = await this.milestoneService.getMilestones({ project });
    if (!milestones.length) {
      return [];
    }
    milestones.forEach(({ tasks }) => {
      tasks.forEach(({ oracle }) => {
        if (!oracles.includes(oracle)) {
          oracles.push(oracle);
        }
      });
    });
    return oracles;
  },

  async transitionFinishedProjects(projectId) {
    logger.info(
      '[ProjectService] :: Entering transitionFinishedProjects method'
    );
    const projects = await this.projectDao.findAllByProps(
      {
        id: projectId,
        status: projectStatuses.EXECUTING
      },
      { funders: true }
    );

    const projectResults = await Promise.all(
      projects.map(async project => {
        logger.info(
          '[ProjectService] :: Checking if all milestones have transferred status',
          project.id
        );
        if (!this.milestoneService.hasAllTransferredMilestones(project.id)) {
          return;
        }
        await this.updateProject(project.id, {
          status: projectStatuses.FINISHED
        });
        return { projectId: project.id, newStatus: projectStatuses.FINISHED };
      })
    );
    return projectResults.filter(updated => !!updated);
  },
  validateCurrencyType(currencyType) {
    if (currencyType.toLowerCase() === currencyTypes.FIAT)
      throw new COAError(errors.project.ProjectIsNotFundedCrypto);
  },

  async getProjectTransactions({ projectId, type }) {
    logger.info('[ProjectService] :: Entering getProjectTransactions method');
    const project = await checkExistence(this.projectDao, projectId, 'project');
    const { currencyType, currency, additionalCurrencyInformation } = project;
    this.validateCurrencyType(currencyType);
    return this.blockchainService.getTransactions({
      currency,
      address: additionalCurrencyInformation.trim(),
      type
    });
  },

  async getProjectChangelog(paramObj) {
    logger.info('[ProjectService] :: Entering getProjectChangelog method');
    const project = await this.projectDao.getLastProjectWithValidStatus(
      paramObj.project
    );
    const changelogs = await this.changelogService.getChangelog(paramObj);
    return changelogs.map(changelog => ({
      ...changelog,
      project: { ...project, id: paramObj.project }
    }));
  },

  async updateProjectStatus({
    user,
    projectId,
    newStatus,
    validateAction,
    action
  }) {
    logger.info('[ProjectService] :: Entering updateProjectStatus method');

    validateRequiredParams({
      method: 'updateProjectStatus',
      params: { projectId, user }
    });

    const project = await checkExistence(this.projectDao, projectId, 'project');

    this.validateProjectStep({
      project,
      step: PROJECT_STEPS.OPEN_REVIEW_PROJECT
    });

    logger.info(
      `[Project Service] :: Validate project ${projectId} status transition from ${
        project.status
      } to  review`
    );

    await validateProjectStatusChange({
      user,
      newStatus,
      project
    });

    logger.info(
      `[Project Service] :: Validate if user ${
        user.id
      } has beneficiary or investor role`
    );

    await validateAction();

    const users = await this.getUsersByProjectId({ projectId });

    const isSendToReview = newStatus === projectStatuses.IN_REVIEW;

    const toUpdate = isSendToReview
      ? {
          status: newStatus,
          ipfsHash: await this.uploadProjectMetadataToIPFS({ project, users }),
          proposer: user.id,
          step: PROJECT_STEPS.PENDING_SIGNATURE_AUTHORIZATION
        }
      : { status: newStatus, step: PROJECT_STEPS.AUDITED_PROJECT_REVIEW };

    const projectUpdated = await this.updateProject(projectId, toUpdate);

    if (isSendToReview) {
      await this.mailService.sendEmails({ project, action, users });
    }

    if (!isSendToReview) {
      logger.info('[ProjectService] :: About to create changelog');
      await this.changelogService.createChangelog({
        project: project.parent || projectId,
        revision: project.revision,
        action,
        user: user.id
      });
    }

    const toReturn = {
      success: !!projectUpdated
    };

    if (isSendToReview) {
      const projectParentId = project.parent;
      const proposedIpfsHash = toUpdate.ipfsHash;
      const proposerEmail = user.email;
      const toSign = {
        projectId: projectParentId,
        proposedIpfsHash,
        proposerEmail,
        messageHash: getMessageHash(
          ['uint256', 'string', 'string'],
          [projectParentId, proposedIpfsHash, proposerEmail]
        )
      };
      logger.info('[ProjectService] :: Message hash information:', toSign);
      return {
        ...toReturn,
        toSign: toSign.messageHash
      };
    }

    return toReturn;
  },

  async sendProjectToReview({ user, projectId }) {
    logger.info('[ProjectService] :: Entering sendProjectToReview method');

    return this.updateProjectStatus({
      user,
      projectId,
      newStatus: projectStatuses.IN_REVIEW,
      action: ACTION_TYPE.SEND_PROJECT_TO_REVIEW,
      validateAction: async () =>
        this.userProjectService.validateUserWithRoleInProject({
          user: user.id,
          descriptionRoles: [rolesTypes.BENEFICIARY, rolesTypes.FUNDER],
          project: projectId,
          error: errors.project.UserCanNotMoveProjectToReview
        })
    });
  },

  async cancelProjectReview({ user, projectId }) {
    logger.info('[ProjectService] :: Entering cancelProjectReview method');

    return this.updateProjectStatus({
      user,
      projectId,
      newStatus: projectStatuses.CANCELLED_REVIEW,
      action: ACTION_TYPE.CANCEL_REVIEW,
      validateAction: async () =>
        this.userProjectService.validateUserWithRoleInProject({
          user: user.id,
          descriptionRoles: [rolesTypes.BENEFICIARY, rolesTypes.FUNDER],
          project: projectId,
          error: errors.project.UserCanNotMoveProjectToCancelReview
        })
    });
  },

  async updateProjectReview({ userId, approved, projectId, reason }) {
    logger.info('[ProjectService] :: Entering updateProjectReview method');
    const project = await checkExistence(
      this.projectDao,
      projectId,
      'project',
      this.projectDao.getProjectWithProposer(projectId)
    );
    if (!project.parent) {
      throw new COAError(errors.project.GivenProjectIsNotAClone(projectId));
    }
    if (project.status !== projectStatuses.IN_REVIEW) {
      throw new COAError(errors.project.CantUpdateReview(project.status));
    }

    logger.info('[ProjectService] :: Getting project users');
    const users = await this.getUsersByProjectId({ projectId });

    let toUpdate;

    if (approved) {
      const status = await this.getLastRevisionStatus(project.parent);
      const { ipfsHash } = await this.publishProject({
        projectId,
        userId,
        previousStatus: status
      });
      toUpdate = {
        status,
        ipfsHash
      };
    } else {
      const status = projectStatuses.CANCELLED_REVIEW;
      const auditIpfsHash = await this.uploadProjectMetadataToIPFS({
        project: { ...project, status },
        users
      });
      toUpdate = {
        status,
        revision: project.revision - 1,
        ipfsHash: auditIpfsHash
      };
    }

    await this.updateProject(projectId, toUpdate);

    const submitProjectEditAuditResultParams = {
      projectId: project.parent,
      proposalIpfsHash: project.ipfsHash,
      auditIpfsHash: toUpdate.ipfsHash,
      proposerAddress: project.proposer.address,
      approved
    };

    logger.info(
      '[ProjectService] :: Call submitProjectEditAuditResultParams method with following params',
      submitProjectEditAuditResultParams
    );
    const transaction = await coa.submitProjectEditAuditResult(
      submitProjectEditAuditResultParams
    );

    logger.info(
      '[ProjectService] :: Information about the transaction sent',
      transaction
    );

    const action = approved
      ? ACTION_TYPE.APPROVE_REVIEW
      : ACTION_TYPE.CANCEL_REVIEW;

    logger.info('[ProjectService] :: Creating changelog');
    await this.changelogService.createChangelog({
      project: project.parent,
      revision: project.revision,
      action,
      user: userId,
      extraData: !approved && reason ? { reason } : undefined,
      transaction: transaction.hash
    });

    logger.info(
      '[ProjectService] :: Notifying project users of review audit result by email'
    );
    await this.mailService.sendEmails({ project, action, users });

    return { projectId };
  },
  async updateStatusIfProjectIsComplete(projectId) {
    const isCompleted = await this.isProjectComplete(projectId);
    logger.info('[ProjectService] :: Project is complete: ', isCompleted);
    if (isCompleted) {
      await this.updateProject(projectId, {
        status: projectStatuses.COMPLETED
      });
    }
  },
  async isProjectComplete(projectId) {
    logger.info('[ProjectService] :: Entering isComplete method');
    const milestones = await this.milestoneService.getMilestonesByProject(
      projectId
    );
    return milestones.every(
      milestone => milestone.status === MILESTONE_STATUS.APPROVED
    );
  },

  async sendProjectReviewTransaction({
    user,
    projectId,
    authorizationSignature
  }) {
    logger.info(
      '[ProjectService] :: Entering sendProjectReviewTransaction method'
    );
    const project = await checkExistence(this.projectDao, projectId, 'project');

    this.validateProjectStep({
      project,
      step: PROJECT_STEPS.PENDING_SIGNATURE_AUTHORIZATION
    });

    if (project.status !== projectStatuses.IN_REVIEW) {
      throw new COAError(errors.project.CantSendProposeProjectEditTransaction);
    }

    validateUsersAreEqualsOrThrowError({
      firstUserId: user.id,
      secondUserId: project.proposer,
      error: errors.project.OnlyProposerCanSendProposeProjectEditTransaction
    });

    const proposeProjectEditParams = {
      projectId: project.parent,
      proposedIpfsHash: project.ipfsHash,
      proposerEmail: user.email,
      authorizationSignature
    };
    logger.info(
      '[ProjectService] :: Call proposeProjectEdit method with following params',
      proposeProjectEditParams
    );
    const transaction = await coa.proposeProjectEdit(proposeProjectEditParams);

    logger.info(
      '[ProjectService] :: Information about the transaction sent',
      transaction
    );

    await this.updateProject(projectId, {
      step: PROJECT_STEPS.AUDITED_PROJECT_REVIEW
    });

    logger.info('[ProjectService] :: About to insert changelog');
    await this.changelogService.createChangelog({
      project: project.parent || project.id,
      revision: project.revision,
      user: user.id,
      action: ACTION_TYPE.SEND_PROJECT_TO_REVIEW,
      transaction: transaction.hash
    });

    const toReturn = { txHash: transaction.hash };

    return toReturn;
  },

  async uploadProjectMetadataToIPFS({ project, users }) {
    logger.info('[ProjectService] :: Entering uploadProjectFileToIPFS method');
    const projectMetadata = {
      id: project.parent || project.id,
      name: project.projectName,
      mission: project.mission,
      problem: project.problemAddressed,
      users,
      agreementFileHash: project.agreementFileHash,
      proposalFileHash: project.proposalFileHash,
      milestones: project.milestones,
      revision: project.revision,
      type: project.type
    };
    logger.info(
      '[ProjectService] :: Saving project meetadata to storage service'
    );
    return this.storageService.saveStorageData({
      data: JSON.stringify(projectMetadata)
    });
  },

  async getLastRevisionStatus(projectId) {
    logger.info('[ProjectService] :: Getting project last revision status');
    const project = await this.projectDao.getLastProjectWithValidStatus(
      projectId
    );
    return project.status;
  },

  validateProjectStep({ project, step }) {
    logger.info('[ProjectService] :: Entering validateProjectStep method');
    logger.info('[ProjectService] :: Project step is:', project.step);
    if (project.step !== step) {
      throw new COAError(errors.common.InvalidStep);
    }
  },

  validateProjectType(type) {
    if (!Object.values(PROJECT_TYPES).includes(type)) {
      throw new COAError(errors.project.InvalidProjectType);
    }
  },

  async validateProjectBudget(projectId) {
    const activities = await this.activityService.getActivitiesByProject(
      projectId
    );

    const fundingActivitiesBudget = this.activityService.getActivitiesBudget({
      activities,
      type: ACTIVITY_TYPES.FUNDING
    });

    const spendingActivitiesBudget = this.activityService.getActivitiesBudget({
      activities,
      type: ACTIVITY_TYPES.SPENDING
    });

    if (!fundingActivitiesBudget.isEqualTo(spendingActivitiesBudget)) {
      throw new COAError(errors.project.InvalidActivitiesBudget);
    }
  },

  async getProjectEvidences({ projectId, limit }) {
    logger.info('[ProjectService] :: Entering getProjectEvidences method');
    const evidences = await this.activityService.getApprovedEvidencesByProject({
      projectId,
      limit
    });
    const mappedEvidences = evidences.map(_evidence => ({
      amount: _evidence.amount,
      activityType: _evidence.activity.type,
      destinationAccount: _evidence.destinationAccount,
      userName: `${_evidence.user.firstName} ${_evidence.user.lastName}`,
      date: _evidence.createdAt,
      userId: _evidence.user.id
    }));

    const evidencesWithRole = await Promise.all(
      mappedEvidences.map(async ({ userId, ...evidence }) => {
        const userProjects = await this.userProjectDao.getRolesOfUser({
          user: userId,
          project: projectId
        });
        const userProject = userProjects.find(
          up => up.role.description !== rolesTypes.AUDITOR
        );
        const toReturn = { ...evidence, role: userProject.role.description };
        return toReturn;
      })
    );
    const toReturn = { evidences: evidencesWithRole };
    return toReturn;
  }
};
