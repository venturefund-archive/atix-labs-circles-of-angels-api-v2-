/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty, remove, zip } = require('lodash');
const { coa } = require('@nomiclabs/buidler');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const validateStatusToUpdate = require('./helpers/validateStatusToUpdate');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { readExcelData } = require('../util/excelParser');
const { sha3 } = require('../util/hash');
const {
  xlsxConfigs,
  projectStatuses,
  claimMilestoneStatus,
  userRoles
} = require('../util/constants');
const files = require('../util/files');

const logger = require('../logger');

module.exports = {
  async getMilestoneById(id) {
    logger.info('[MilestoneService] :: Entering getMilestoneById method');
    const milestone = await checkExistence(this.milestoneDao, id, 'milestone');
    logger.info(`[MilestoneService] :: Milestone id ${milestone.id} found`);
    return milestone;
  },
  /**
   * Returns the project that the milestone belongs to
   * or `undefined` if the milestone doesn't have a project.
   *
   * Throws an error if the milestone does not exist
   *
   * @param {number} id
   * @returns project | `undefined`
   */
  async getProjectFromMilestone(milestoneId) {
    logger.info(
      '[MilestoneService] :: Entering getProjectFromMilestone method'
    );

    const milestone = await this.milestoneDao.getMilestoneByIdWithProject(
      milestoneId
    );
    if (!milestone) {
      throw new COAError(errors.milestone.MilestoneDoesNotBelongToProject);
    }
    const { project } = milestone;
    if (!project) {
      logger.info(
        `[MilestoneService] :: No project found for milestone ${milestoneId}`
      );
      throw new COAError(errors.milestone.ProjectNotFound(milestoneId));
    }
    return project;
  },

  /**
   * Creates a Milestone for an existing Project.
   * Returns an object with the id of the new milestone
   *
   * @param { projectId: number; title: string; description: string; } createMilestoneParams
   * @returns { {milestoneId: number} } id of updated milestone
   */
  async createMilestone({ projectId, title, description }) {
    logger.info('[MilestoneService] :: Entering createMilestone method');

    validateRequiredParams({
      method: 'createMilestone',
      params: {
        projectId,
        title,
        description
      }
    });

    logger.info(`[MilestoneService] :: Getting project ${projectId}`);
    const project = await this.projectService.getProject(projectId);
    if (!project) {
      logger.info(`[MilestoneService] :: Project ${projectId} not found`);
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }

    validateStatusToUpdate({
      status: project.status,
      error: errors.milestone.CreateWithInvalidProjectStatus
    });

    logger.info(
      `[MilestoneService] :: Creating new milestone in project ${projectId}`
    );
    const createdMilestone = await this.milestoneDao.saveMilestone({
      milestone: { title, description },
      projectId
    });
    logger.info(
      `[MilestoneService] :: New milestone with id ${
        createdMilestone.id
      } created`
    );

    // TODO: should it be able to create tasks if provided?

    return { milestoneId: createdMilestone.id };
  },

  /**
   * Updates an existing milestone.
   * Returns an object with the id of the updated milestone
   *
   * @param {milestoneId: number; title: string; description: string;} updateMilestoneParams
   * @returns { {milestoneId: number} } id of updated milestone
   */
  async updateMilestone({ milestoneId, title, description }) {
    logger.info('[MilestoneService] :: Entering updateMilestone method');
    validateRequiredParams({
      method: 'updateMilestone',
      params: { milestoneId, title, description }
    });
    await checkExistence(this.milestoneDao, milestoneId, 'milestone');
    const project = await this.getProjectFromMilestone(milestoneId);

    validateStatusToUpdate({
      status: project.status,
      error: errors.milestone.UpdateWithInvalidProjectStatus
    });

    logger.info(
      `[MilestoneService] :: Updating milestone of id ${milestoneId}`
    );
    const updatedMilestone = await this.milestoneDao.updateMilestone(
      { title, description },
      milestoneId
    );
    logger.info(
      `[MilestoneService] :: Milestone of id ${updatedMilestone.id} updated`
    );
    return { milestoneId: updatedMilestone.id };
  },

  /**
   * Permanently remove an existing milestone and all its tasks
   * Returns an object with the id of the deleted milestone
   *
   * @param milestoneId
   * @returns { {milestoneId: number} } id of deleted milestone
   */
  async deleteMilestone(milestoneId) {
    logger.info('[MilestoneService] :: Entering deleteMilestone method');
    validateRequiredParams({
      method: 'deleteMilestone',
      params: { milestoneId }
    });
    await checkExistence(this.milestoneDao, milestoneId, 'milestone');
    const project = await this.getProjectFromMilestone(milestoneId);

    if (!project) {
      throw errors.project.ProjectNotFound;
    }

    validateStatusToUpdate({
      status: project.status,
      error: errors.milestone.DeleteWithInvalidProjectStatus
    });

    const milestoneTasks = await this.milestoneDao.getMilestoneTasks(
      milestoneId
    );
    const milestoneBudget = milestoneTasks.reduce(
      (total, task) => Number(task.budget) + total,
      0
    );

    logger.info(
      `[MilestoneService] :: Deleting milestone of id ${milestoneId}`
    );
    const deletedMilestone = await this.milestoneDao.deleteMilestone(
      milestoneId
    );
    logger.info(
      `[MilestoneService] :: Milestone of id ${deletedMilestone.id} deleted`
    );

    const newGoalAmount = Number(project.goalAmount) - milestoneBudget;
    logger.info(
      `[MilestoneService] :: Updating project ${
        project.id
      } goalAmount to ${newGoalAmount}`
    );
    await this.projectService.updateProject(project.id, {
      goalAmount: newGoalAmount
    });

    return { milestoneId: deletedMilestone.id };
  },

  deleteFieldsFromMilestone(milestone) {
    const newMilestone = milestone;
    delete newMilestone.impact;
    delete newMilestone.impactCriterion;
    delete newMilestone.signsOfSuccess;
    delete newMilestone.signsOfSuccessCriterion;
    delete newMilestone.keyPersonnel;
    delete newMilestone.budget;
    newMilestone.description = milestone.tasks;
    delete newMilestone.quarter;
    delete newMilestone.tasks;
    newMilestone.category = milestone.category;
    delete newMilestone.activityList;
    delete newMilestone.updatedAt;
    delete newMilestone.transactionHash;
    delete newMilestone.budgetStatus;
    delete newMilestone.blockchainStatus;
    return newMilestone;
  },

  deleteFieldsFromActivities(activities) {
    return activities.map(activity => {
      // eslint-disable-next-line no-param-reassign
      activity.reviewCriteria = activity.impactCriterion;
      // eslint-disable-next-line no-param-reassign
      activity.description = activity.tasks;
      return activity;
    });
  },

  /**
   * Receives an excel file, saves it and creates the Milestones
   * associated to the Project passed by parameter.
   *
   * Returns an array with all the Milestones created.
   * @param {*} file
   * @param {number} projectId
   */
  async createMilestones(file, projectId) {
    if (!file.data)
      throw new COAError(errors.milestone.CantProcessMilestonesFile);
    try {
      const response = await this.processMilestones(file.data);

      if (response.errors.length > 0) {
        logger.error(
          '[Milestone Service] :: Found errors while reading the excel file:',
          response.errors
        );
        return response;
      }

      const { milestones } = response;

      logger.info(
        '[Milestone Service] :: Creating Milestones for Project ID:',
        projectId
      );

      const savedMilestones = await Promise.all(
        milestones.map(async milestone => {
          if (!this.isMilestoneEmpty(milestone)) {
            const activityList = milestone.activityList.slice(0);
            const milestoneWithoutFields = this.deleteFieldsFromMilestone(
              milestone
            );

            const savedMilestone = await this.milestoneDao.saveMilestone({
              milestone: milestoneWithoutFields,
              projectId
            });
            logger.info(
              '[Milestone Service] :: Milestone created:',
              savedMilestone
            );
            // create the activities for this milestone
            const savedActivities = await this.activityService.createActivities(
              this.deleteFieldsFromActivities(activityList),
              savedMilestone.id
            );
            return { ...savedMilestone, tasks: savedActivities };
          }
        })
      );

      return savedMilestones;
    } catch (err) {
      logger.error('[Milestone Service] :: Error creating Milestones:', err);
      throw new COAError(errors.milestone.ErrorCreatingMilestonesFromFile);
    }
  },

  /**
   * Process the excel file with the Milestones and Activities' information.
   *
   * Returns an array with all the information retrieved.
   * @param {Buffer} data buffer data from the excel file
   */
  async processMilestones(data) {
    const response = {
      milestones: [],
      errors: []
    };
    let milestone = { activityList: [] };
    let actualQuarter;
    const COLUMN_KEY = 0;

    const getStandardAttributes = row => {
      const entry = {};
      while (!isEmpty(row)) {
        const cell = row.shift();
        entry[xlsxConfigs.keysMap[cell[COLUMN_KEY]]] = worksheet[cell].v;
      }
      return entry;
    };

    const pushErrorBuilder = rowNumber => msg => {
      response.errors.push({ rowNumber, msg });
    };

    const { worksheet, cellKeys, nameMap } = readExcelData(data);
    // for each row
    while (!isEmpty(cellKeys)) {
      let rowNum = cellKeys[0].slice(1);
      const row = remove(cellKeys, k => k.slice(1) === rowNum);
      rowNum = parseInt(rowNum, 10);

      const pushError = pushErrorBuilder(rowNum);

      if (worksheet[`${nameMap.quarter}${rowNum}`]) {
        actualQuarter = worksheet[`${nameMap.quarter}${rowNum}`].v;
      }

      //  if is not a milestone/activity row then continue
      if (worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`]) {
        const type = worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`].v;
        remove(
          row,
          col =>
            col[COLUMN_KEY] === nameMap.quarter ||
            col[COLUMN_KEY] === xlsxConfigs.typeColumnKey
        ); // remove timeline

        if (type.includes('Milestone')) {
          if (!actualQuarter) {
            pushError('Found a milestone without quarter');
          }

          if (!this.isMilestoneEmpty(milestone)) {
            if (milestone.activityList.length === 0) {
              pushError('Found a milestone without activities');
            }
          }

          milestone = { activityList: [] };
          Object.assign(milestone, getStandardAttributes(row));
          milestone.quarter = actualQuarter;
          this.verifyMilestone(milestone, pushError);
          response.milestones.push(milestone);
          // Activity
        } else {
          const activity = {};
          Object.assign(activity, getStandardAttributes(row));
          if (
            !this.isMilestoneValid(milestone) ||
            this.isMilestoneEmpty(milestone)
          ) {
            pushError(
              'Found an activity without an specified milestone or inside an invalid milestone'
            );
          }
          this.verifyActivity(activity, pushError);
          milestone.activityList.push(activity);
        }
      }
    }
    return response;
  },

  isMilestoneEmpty(milestone) {
    return milestone.activityList && Object.keys(milestone).length === 1;
  },

  isMilestoneValid(milestone) {
    if (
      !this.isMilestoneEmpty(milestone) &&
      (!milestone.quarter ||
        milestone.quarter === '' ||
        !milestone.tasks ||
        milestone.tasks === '' ||
        !milestone.impact ||
        milestone.impact === '')
    ) {
      return false;
    }

    return true;
  },

  verifyMilestone(milestone, pushError) {
    let valid = true;
    const toVerify = ['tasks', 'category'];
    toVerify.forEach(field => {
      if (!milestone[field] || milestone[field] === '') {
        valid = false;
        pushError(
          `Found a milestone without ${
            xlsxConfigs.columnNames[field]
          } specified`
        );
      }
    });

    return valid;
  },

  verifyActivity(activity, pushError) {
    let valid = true;
    const toVerify = [
      'tasks',
      'impact',
      'impactCriterion',
      'signsOfSuccess',
      'signsOfSuccessCriterion',
      'category',
      'keyPersonnel',
      'budget'
    ];

    toVerify.forEach(field => {
      if (!activity[field] || activity[field] === '') {
        valid = false;
        pushError(
          `Found an activity without ${
            xlsxConfigs.columnNames[field]
          } specified`
        );
      }
    });

    return valid;
  },

  /**
   * Returns an array with all milestones and its tasks of an specified project
   *
   * @param {number} projectId
   * @returns
   */
  async getAllMilestonesByProject(projectId) {
    logger.info(
      '[MilestoneService] :: Entering getAllMilestonesByProject method'
    );

    const milestones = await this.milestoneDao.getMilestonesByProjectId(
      projectId
    );

    const milestonesWithTaskStatus = await Promise.all(
      milestones.map(async milestone => {
        const tasksWithStatus = await Promise.all(
          milestone.tasks.map(async task => {
            const verified = await this.activityService.isTaskVerified(task.id);
            return { ...task, verified };
          })
        );
        return { ...milestone, tasks: tasksWithStatus };
      })
    );

    return milestonesWithTaskStatus;
  },

  async getMilestones(filters) {
    logger.info('[MilestoneService] :: Entering getMilestones method');
    const milestones = await this.milestoneDao.getMilestones(filters || {});
    logger.info(
      '[MilestoneService] :: About to get evidences of milestones tasks'
    );
    const milestonesWithEvidences = await Promise.all(
      milestones.map(async milestone => ({
        ...milestone,
        tasks: await Promise.all(
          milestone.tasks.map(async task => ({
            ...task,
            evidences: await this.taskEvidenceDao.getEvidencesByTaskId(task.id)
          }))
        )
      }))
    );
    logger.info(
      `[MilestoneService] :: ${
        milestonesWithEvidences.length
      } milestones were found`
    );
    return milestonesWithEvidences;
  },

  /**
   * Update claim status for the specific milestone
   *
   * @param {number} milestoneId
   * @param {number} userId
   * @returns
   */
  async claimMilestone({ milestoneId, userId }) {
    logger.info('[MilestoneService] :: Entering claimMilestone method');
    validateRequiredParams({
      method: 'claimMilestone',
      params: { milestoneId, userId }
    });

    const milestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    const { project: projectId, claimStatus } = milestone;

    logger.info(
      `[MilestoneService] :: Found milestone ${milestoneId} of project ${projectId}`
    );

    const project = await this.projectService.getProjectById(projectId);
    const { status, owner } = project;

    validateOwnership(owner, userId);

    if (status !== projectStatuses.EXECUTING) {
      logger.error(
        `[MilestoneService] :: Can't claim milestone when project is in ${status} status`
      );
      throw new COAError(errors.project.InvalidStatusForClaimMilestone(status));
    }

    if (claimStatus !== claimMilestoneStatus.CLAIMABLE) {
      logger.error(
        `[MilestoneService] :: Can't claim milestone when milestone is in ${claimStatus} status`
      );
      throw new COAError(
        errors.milestone.InvalidStatusForClaimMilestone(claimStatus)
      );
    }

    const milestoneUpdated = await this.milestoneDao.updateMilestone(
      {
        claimStatus: claimMilestoneStatus.CLAIMED
      },
      milestoneId
    );

    return { milestoneId: milestoneUpdated.id };
  },

  /**
   * Mark claim as transferred
   *
   * @param {number} milestoneId
   * @param {number} userId
   * @param {File} receiptFile
   * @returns {{ milestoneId: number }}
   */
  async transferredMilestone({ milestoneId, userId, claimReceiptFile }) {
    logger.info('[MilestoneService] :: Entering transferredMilestone method');
    validateRequiredParams({
      method: 'transferredMilestone',
      params: { milestoneId, userId, claimReceiptFile }
    });

    const user = await this.userService.getUserById(userId);

    if (user.role !== userRoles.BANK_OPERATOR) {
      logger.error(
        `[MilestoneService] :: User ${userId} is not authorized for this action`
      );
      throw new COAError(errors.common.UserNotAuthorized(userId));
    }

    const milestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    const { project: projectId, claimStatus } = milestone;

    logger.info(
      `[MilestoneService] :: Found milestone ${milestoneId} of project ${projectId}`
    );

    const project = await this.projectService.getProjectById(projectId);
    const { status } = project;

    if (status !== projectStatuses.EXECUTING) {
      logger.error(
        `[MilestoneService] :: Can't set as transferred a milestone when project is in ${status} status`
      );
      throw new COAError(errors.common.InvalidStatus('project', status));
    }

    if (claimStatus !== claimMilestoneStatus.CLAIMED) {
      logger.error(
        `[MilestoneService] :: Can't set as transferred a milestone when is in ${claimStatus} status`
      );
      throw new COAError(errors.common.InvalidStatus('milestone', claimStatus));
    }

    logger.info('[MilestoneService] :: Uploading claim receipt');
    const claimReceiptPath = await files.validateAndSaveFile(
      files.TYPES.milestoneClaim,
      claimReceiptFile
    );
    logger.info(
      `[MilestoneService] :: Setting milestone ${milestoneId} as ${
        claimMilestoneStatus.TRANSFERRED
      }`
    );

    const milestoneUpdated = await this.milestoneDao.updateMilestone(
      {
        claimStatus: claimMilestoneStatus.TRANSFERRED,
        claimReceiptPath
      },
      milestoneId
    );

    try {
      const milestoneCompleted = await this.isMilestoneCompleted(milestoneId);
      if (milestoneCompleted) {
        logger.info(
          '[MilestoneService] :: Marking next milestone as claimable'
        );
        await this.setNextAsClaimable(milestoneId);
      } else {
        logger.info(
          `[MilestoneService] :: Milestone ${milestoneId} is not completed yet`
        );
      }
    } catch (error) {
      // If it fails still return, do not throw
      logger.error(
        '[MilestoneService] :: Error setting next milestone as claimable',
        error
      );
    }

    return { milestoneId: milestoneUpdated.id };
  },

  /**
   * Updates claim status for the specific milestone
   * to `claimable` and returns its id
   *
   * @param {number} milestoneId
   * @returns {Promise<{numberd}>}
   */
  async setClaimable(milestoneId) {
    logger.info('[MilestoneService] :: Entering setClaimable method');
    validateRequiredParams({
      method: 'setClaimable',
      params: { milestoneId }
    });

    const milestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    const { project: projectId, claimStatus } = milestone;

    logger.info(
      `[MilestoneService] :: Found milestone ${milestoneId} of project ${projectId}`
    );

    const project = await this.projectService.getProjectById(projectId);
    const { status } = project;

    if (status !== projectStatuses.EXECUTING) {
      logger.error(
        `[MilestoneService] :: A milestone can't be claimable when project status is ${status}`
      );
      throw new COAError(
        errors.project.InvalidStatusForClaimableMilestone(status)
      );
    }

    if (claimStatus !== claimMilestoneStatus.PENDING) {
      logger.error(
        `[MilestoneService] :: Can't set milestone as claimable when claim status is ${claimStatus}`
      );
      throw new COAError(
        errors.milestone.InvalidStatusForClaimableMilestone(claimStatus)
      );
    }

    logger.info(
      `[MilestoneService] :: Updating claimStatus of milestone ${milestoneId} as ${
        claimMilestoneStatus.CLAIMABLE
      }`
    );

    const milestoneUpdated = await this.milestoneDao.updateMilestone(
      {
        claimStatus: claimMilestoneStatus.CLAIMABLE
      },
      milestoneId
    );

    return milestoneUpdated.id;
  },

  /**
   * Checks in the blockchain if all tasks from
   * a milestone are approved or not.
   *
   * @param {number} milestoneId
   * @returns {Promise<boolean>} completed
   */
  async isMilestoneCompleted(milestoneId) {
    logger.info('[MilestoneService] :: Entering isMilestoneCompleted method');
    validateRequiredParams({
      method: 'isMilestoneCompleted',
      params: { milestoneId }
    });
    const milestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    const { project: projectId } = milestone;

    const address = await this.projectService.getAddress(projectId);

    if (!address) throw new COAError(errors.project.AddressNotFound(projectId));

    const tasks = await this.milestoneDao.getMilestoneTasks(milestoneId);

    const tasksClaimsWithValidators = await Promise.all(
      tasks.map(async task => {
        const oracle = await this.userService.getUserById(task.oracle);
        if (!oracle || !oracle.address)
          throw new COAError(errors.task.OracleAddressNotFound(task.id));

        const claimHash = sha3(projectId, oracle.id, task.id);
        return [oracle.address, claimHash];
      })
    );

    const [validators, claims] = zip(...tasksClaimsWithValidators);

    const approved = await coa.milestoneApproved(address, validators, claims);

    logger.info(
      `[MilestoneService] :: Milestone ${milestoneId} completed: ${approved}`
    );

    return approved;
  },

  /**
   * Returns the next milestone's id from the same project
   * or `undefined` if it is the last
   *
   * @param {number} milestoneId
   * @returns {Promise<number>}
   */
  async getNextMilestoneId(milestoneId) {
    logger.info('[MilestoneService] :: Entering getNextMilestoneId method');
    validateRequiredParams({
      method: 'getNextMilestoneId',
      params: { milestoneId }
    });
    const foundMilestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    const { project: projectId } = foundMilestone;
    const projectMilestones = await this.getAllMilestonesByProject(projectId);
    const currentMilestoneIndex = projectMilestones.indexOf(
      projectMilestones.find(milestone => milestone.id === milestoneId)
    );

    if (currentMilestoneIndex === projectMilestones.length - 1) {
      // last milestone
      return;
    }

    const nextMilestone = projectMilestones[currentMilestoneIndex + 1];
    return nextMilestone.id;
  },

  /**
   * Finds the next milestone of the project and
   * sets its claim status as `claimable`
   *
   * @param {number} currentMilestoneId
   * @returns {Promise<number>} next milestone id
   */
  async setNextAsClaimable(currentMilestoneId) {
    logger.info('[MilestoneService] :: Entering setNextAsClaimable method');
    const nextMilestoneId = await this.getNextMilestoneId(currentMilestoneId);
    if (!nextMilestoneId) {
      logger.info(
        `[MilestoneService] :: Milestone ${currentMilestoneId} is the last milestone of the project`
      );
      const project = await this.getProjectFromMilestone(currentMilestoneId);
      await this.projectService.updateProjectStatus(
        project.owner,
        project.id,
        projectStatuses.FINISHED
      );
      return;
    }
    return this.setClaimable(nextMilestoneId);
  },
  async removeMilestonesFromProject(projectId) {
    return this.milestoneDao.removeMilestonesByProps({ project: projectId });
  }
};
