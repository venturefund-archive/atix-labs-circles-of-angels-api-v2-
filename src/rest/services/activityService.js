/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop
 * impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { BigNumber } = require('bignumber.js');
const { coa } = require('@nomiclabs/buidler');
const { values, isEmpty } = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const fileUtils = require('../util/files');
const { forEachPromise } = require('../util/promises');
const {
  ACTIVITY_STATUS,
  ACTIVITY_STATUS_TRANSITION,
  projectSections,
  projectStatuses,
  userRoles,
  txEvidenceStatus,
  rolesTypes,
  currencyTypes,
  evidenceTypes,
  evidenceStatus,
  validStatusToChange,
  lastEvidenceStatus,
  MILESTONE_STATUS,
  ACTION_TYPE
} = require('../util/constants');
const { sha3 } = require('../util/hash');
const utilFiles = require('../util/files');

const filesUtil = require('../util/files');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const validateMtype = require('./helpers/validateMtype');
const validateFileSize = require('./helpers/validatePhotoSize');
const { completeStep, removeStep } = require('./helpers/dataCompleteUtil');
const {
  buildBlockURL,
  buildTxURL,
  buildAddressURL
} = require('./helpers/txExplorerHelper');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const validateStatusToUpdate = require('./helpers/validateStatusToUpdate');

const claimType = 'claims';
const EVIDENCE_TYPE = 'evidence';

const removeMinusSign = stringNumber => stringNumber.slice(1);

module.exports = {
  readFile: promisify(fs.readFile),
  /**
   * Updates an existing activity.
   * Returns an object with the id of the updated activity
   *
   * @param { { activityId: number,
   *            title: string,
   *            description: string,
   *            acceptanceCriteria: string,
   *            budget: string,
   *            auditor: string }: object } activityData activity data
   * @returns { { activityId: number } } id of updated activity
   */
  async updateActivity({
    activityId,
    title,
    description,
    acceptanceCriteria,
    budget,
    auditor
  }) {
    logger.info('[ActivityService] :: Entering updateActivity method');
    validateRequiredParams({
      method: 'updateActivity',
      params: {
        activityId,
        title,
        description,
        acceptanceCriteria,
        budget,
        auditor
      }
    });

    const activity = await checkExistence(
      this.activityDao,
      activityId,
      'activity'
    );
    logger.info(
      `[ActivityService] :: Found activity ${activity.id} of milestone ${
        activity.milestone
      }`
    );

    const project = await this.milestoneService.getProjectFromMilestone(
      activity.milestone
    );

    validateStatusToUpdate({
      status: project.status,
      error: errors.task.UpdateWithInvalidProjectStatus
    });

    await this.validateAuditorIsInProject({ project: project.id, auditor });

    logger.info(`[ActivityService] :: Updating task of id ${activityId}`);
    const updatedActivity = await this.activityDao.updateActivity(
      {
        title,
        description,
        acceptanceCriteria,
        budget,
        auditor
      },
      activityId
    );

    const difference = BigNumber(budget).minus(activity.budget);
    if (!difference.isEqualTo(0)) {
      const newGoalAmount = BigNumber(project.goalAmount)
        .plus(difference)
        .toString();
      logger.info(
        `[ActivityService] :: Updating project ${
          project.id
        } goalAmount to ${newGoalAmount}`
      );
      await this.projectService.updateProject(project.id, {
        goalAmount: newGoalAmount
      });
    }

    logger.info(
      `[ActivityService] :: Actvity of id ${updatedActivity.id} updated`
    );

    const activityUpdatedResponse = { activityId: updatedActivity.id };

    return activityUpdatedResponse;
  },
  /**
   * Deletes an existing task.
   * Returns an object with the id of the deleted task
   *
   * @param {number} taskId task identifier
   * @returns { {taskId: number} } id of deleted task
   */
  async deleteTask(taskId) {
    logger.info('[ActivityService] :: Entering deleteTask method');
    validateRequiredParams({
      method: 'deleteTask',
      params: { taskId }
    });

    const task = await checkExistence(this.activityDao, taskId, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const project = await this.milestoneService.getProjectFromMilestone(
      task.milestone
    );
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${task.milestone}`
      );
      throw new COAError(errors.task.ProjectNotFound(taskId));
    }
    // TODO: delete this method
    // validateOwnership(project.owner, userId);

    validateStatusToUpdate({
      status: project.status,
      error: errors.task.DeleteWithInvalidProjectStatus
    });

    logger.info(`[ActivityService] :: Deleting task with id ${taskId}`);
    const deletedTask = await this.activityDao.deleteActivity(taskId);
    logger.info(`[ActivityService] :: Task with id ${deletedTask.id} deleted`);
    if (!deletedTask) {
      logger.error(
        '[ActivityService] :: There was an error trying to delete task'
      );
      throw new COAError(errors.milestone.CantDeleteActivity);
    }
    const milestones = await this.milestoneService.getAllMilestonesByProject(
      project.id
    );
    const milestoneHasTasksLeft = milestones.some(
      milestone => milestone.tasks.length > 0
    );

    const taskBudget = BigNumber(task.budget);
    const newGoalAmount = BigNumber(project.goalAmount)
      .minus(taskBudget)
      .toString();

    const updateFields = {
      goalAmount: newGoalAmount
    };

    if (!milestoneHasTasksLeft) {
      updateFields.dataComplete = removeStep({
        dataComplete: project.dataComplete,
        step: projectSections.MILESTONES
      });
    }
    logger.info(
      `[ActivityService] :: Updating project with id ${
        project.id
      } with fields ${JSON.stringify(updateFields)}`
    );

    const update = await this.projectService.updateProject(
      project.id,
      updateFields
    );
    if (!update) {
      logger.error(
        '[ActivityService] :: There was an error trying to update project'
      );
      throw new COAError(errors.project.CantUpdateProject(project.id));
    }
    return { taskId: deletedTask.id };
  },
  /**
   * Creates an task for an existing Milestone.
   * Returns an object with the id of the new task
   *
   * @param { { milestoneId: number,
   *            title: string,
   *            description: string,
   *            acceptanceCriteria: string,
   *            budget: string,
   *            auditor: string }: object } activityData activity data
   * @returns { {activityId: number} } id of created task
   */
  async createActivity({
    milestoneId,
    title,
    description,
    acceptanceCriteria,
    budget,
    auditor,
    user
  }) {
    logger.info('[ActivityService] :: Entering createActivity method');
    validateRequiredParams({
      method: 'createActivity',
      params: {
        milestoneId,
        title,
        description,
        acceptanceCriteria,
        budget,
        auditor
      }
    });
    logger.info(
      `[ActivityService] :: checking if milestone with id ${milestoneId} exists`
    );
    const milestone = await checkExistence(
      this.milestoneDao,
      milestoneId,
      'milestone'
    );

    if (milestone.status === MILESTONE_STATUS.APPROVED) {
      logger.info(
        `[ActivityService] :: Can't add activities to a milestone with status ${
          milestone.status
        }`
      );
      throw new COAError(errors.milestone.MilestoneIsApproved);
    }

    logger.info(
      `[ActivityService] :: Getting project of milestone ${milestoneId}`
    );
    const project = await this.milestoneService.getProjectFromMilestone(
      milestoneId
    );

    validateStatusToUpdate({
      status: project.status,
      error: errors.task.CreateWithInvalidProjectStatus
    });

    await this.validateAuditorIsInProject({ project: project.id, auditor });

    logger.info(
      `[ActivityService] :: Creating new activity in project ${
        project.id
      }, milestone ${milestoneId}`
    );
    const createdActivity = await this.activityDao.saveActivity(
      {
        title,
        description,
        acceptanceCriteria,
        budget,
        auditor
      },
      milestoneId
    );
    logger.info(
      `[ActivityService] :: New task with id ${createdActivity.id} created`
    );
    const newGoalAmount = BigNumber(project.goalAmount).plus(budget);
    logger.info(
      `[ActivityService] :: Updating project ${
        project.id
      } goalAmount to ${newGoalAmount}`
    );
    await this.projectService.updateProject(project.id, {
      goalAmount: newGoalAmount.toString(),
      dataComplete: completeStep({
        dataComplete: project.dataComplete,
        step: projectSections.MILESTONES
      })
    });

    logger.info('[ProjectService] :: About to create changelog');
    await this.changelogService.createChangelog({
      project: project.parentId || project.id,
      revision: project.revision,
      milestone: milestoneId,
      activity: createdActivity.id,
      action: ACTION_TYPE.ADD_ACTIVITY,
      user
    });

    return { activityId: createdActivity.id };
  },
  async validateAuditorIsInProject({ project, auditor }) {
    logger.info(
      '[ActivityService] :: Entering validateAuditorIsInProject method'
    );

    const auditorRole = await this.roleDao.getRoleByDescription(
      rolesTypes.AUDITOR
    );
    if (!auditorRole) throw COAError(errors.common.ErrorGetting('role'));

    const result = await this.userProjectDao.findUserProject({
      user: auditor,
      project,
      role: auditorRole.id
    });

    if (!result)
      throw new COAError(
        errors.task.UserIsNotAuditorInProject(auditor, project)
      );
  },
  /**
   * Assigns an existing oracle candidate to a task.
   *
   * @param {number} taskId task id
   * @param {number} oracleId oracle id to assign
   * @param {number} userId user making the request
   */
  async assignOracle(taskId, oracleId, userId) {
    logger.info('[ActivityService] :: Entering assignOracle method');
    validateRequiredParams({
      method: 'assignOracle',
      params: { taskId, oracleId, userId }
    });
    const task = await checkExistence(this.activityDao, taskId, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );
    const project = await this.milestoneService.getProjectFromMilestone(
      task.milestone
    );
    validateOwnership(project.owner, userId);
    const oracle = await this.userService.getUserById(oracleId);

    if (oracle.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(
        `[ActivityService] :: User ${oracleId} is not a project supporter`
      );
      throw new COAError(errors.user.IsNotSupporter);
    }

    if (project.status !== projectStatuses.CONSENSUS) {
      logger.error(
        `[ActivityService] :: Status of project with id ${project.id} is not ${
          projectStatuses.CONSENSUS
        }`
      );
      throw new COAError(
        errors.task.AssignOracleWithInvalidProjectStatus(project.status)
      );
    }

    const isOracleCandidate = await this.projectService.isOracleCandidate({
      projectId: project.id,
      userId: oracleId
    });

    if (!isOracleCandidate) {
      logger.error(
        `[ActivityService] :: User of id ${oracleId} is not an oracle candidate for project ${
          project.id
        }`
      );
      throw new COAError(errors.task.NotOracleCandidate);
    }

    logger.info(
      `[ActivityService] :: Assigning oracle of id ${oracleId} to task ${taskId}`
    );
    const updatedTask = await this.activityDao.updateActivity(
      { oracle: oracleId },
      taskId
    );
    logger.info(`[ActivityService] :: Task of id ${updatedTask.id} updated`);
    return { taskId: updatedTask.id };
  },

  /**
   * Creates new Activities and associates them to the Milestone passed by parameter.
   *
   * Returns an array with all the Activities created.
   * @param {array} activities
   * @param {number} milestoneId
   */
  async createActivities(activities, milestoneId) {
    logger.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!values(activity).every(isEmpty)) {
            const savedActivity = await this.activityDao.saveActivity(
              activity,
              milestoneId
            );
            logger.info(
              '[Activity Service] :: Activity created:',
              savedActivity
            );
            context.push(savedActivity);
          }
          resolve();
        });
      });

    await forEachPromise(activities, createActivity, savedActivities);
    return savedActivities;
  },

  /**
   * Returns the milestone that the task belongs to or `undefined`
   *
   * Throws an error if the task does not exist
   *
   * @param {number} id
   * @returns milestone | `undefined`
   */
  async getMilestoneAndTaskFromId(id) {
    logger.info('[ActivityService] :: Entering getMilestoneFromTask method');
    const task = await checkExistence(this.activityDao, id, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const { milestone } = await this.activityDao.getTaskByIdWithMilestone(id);
    if (!milestone) {
      logger.info(`[ActivityService] :: No milestone found for task ${id}`);
      throw new COAError(errors.task.MilestoneNotFound(id));
    }

    return { milestone, task };
  },

  /**
   * Sends the signed transaction to the blockchain
   * and saves the evidence in the database
   *
   * @param {Number} taskId
   * @param {Number} userId
   * @param {File} file
   * @param {String} description
   * @param {Boolean} approved
   * @param {Transaction} signedTransaction
   */
  async sendAddClaimTransaction({
    taskId,
    userId,
    file,
    description,
    approved,
    signedTransaction,
    userAddress
  }) {
    logger.info('[ActivityService] :: Entering sendAddClaimTransaction method');
    validateRequiredParams({
      method: 'sendAddClaimTransaction',
      params: {
        taskId,
        userId,
        file,
        description,
        approved,
        signedTransaction,
        userAddress
      }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { project: projectId } = milestone;
    const { oracle } = task;

    const projectFound = await this.projectService.getProjectById(projectId);
    const { status } = projectFound;

    if (status !== projectStatuses.EXECUTING) {
      logger.error(
        `[ActivityService] :: Can't upload evidence when project is in ${status} status`
      );
      throw new COAError(errors.project.InvalidStatusForEvidenceUpload(status));
    }

    if (oracle !== userId) {
      logger.error(
        `[ActivityService] :: User ${userId} is not the oracle assigned for task ${taskId}`
      );
      throw new COAError(errors.task.OracleNotAssigned({ userId, taskId }));
    }

    logger.info(
      '[ActivityService] :: Sending signed tx to the blockchain for task',
      taskId
    );
    try {
      const tx = await coa.sendNewTransaction(signedTransaction);
      logger.info('[ActivityService] :: Add claim transaction sent', tx);

      // TODO: we shouldn't save the file once we have the ipfs storage working
      logger.info(`[ActivityService] :: Saving file of type '${claimType}'`);
      const filePath = await fileUtils.validateAndSaveFile(claimType, file);
      logger.info(`[ActivityService] :: File saved to: ${filePath}`);
      const evidence = {
        description,
        proof: filePath,
        task: taskId,
        approved,
        txHash: tx.hash,
        status: txEvidenceStatus.SENT
      };
      logger.info('[ActivityService] :: Saving evidence in database', evidence);
      const taskEvidence = await this.taskEvidenceDao.addTaskEvidence(evidence);
      await this.transactionService.save({
        sender: userAddress,
        txHash: tx.hash,
        nonce: tx.nonce
      });
      return { claimId: taskEvidence.id };
    } catch (error) {
      logger.info(`[ActivityService] :: Blockchain error :: ${error}`);
      throw new COAError(error);
    }
  },

  /**
   * Receives a task evidence and sends the unsigned
   * transaction to the client with the user's encrypted json wallet
   *
   * @param {Number} taskId
   * @param {Number} userId
   * @param {File} file
   * @param {Boolean} approved
   * @param {JSON} userWallet
   */
  async getAddClaimTransaction({ taskId, file, approved, userWallet }) {
    logger.info('[ActivityService] :: Entering getAddClaimTransaction method');
    validateRequiredParams({
      method: 'getAddClaimTransaction',
      params: { taskId, file, approved, userWallet }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { id: milestoneId, project: projectId } = milestone;
    const { oracle } = task;
    const projectFound = await this.projectService.getProjectById(projectId);
    const { address } = projectFound;

    // TODO: we shouldn't save the file once we have the ipfs storage working
    validateMtype(claimType, file);
    validateFileSize(file);
    const filePath = await fileUtils.getSaveFilePath(claimType, file);
    logger.info(
      `[ActivityService] :: File to be saved in ${filePath} when tx is sent`
    );

    const claim = sha3(projectId, oracle, taskId);
    const proof = sha3(filePath); // TODO: this should be an ipfs hash

    logger.info('[ActivityService] :: Getting add claim transaction');

    try {
      const unsignedTx = await coa.getAddClaimTransaction(
        address,
        claim,
        proof,
        approved,
        milestoneId
      );
      const nonce = await this.transactionService.getNextNonce(
        userWallet.address
      );
      const txWithNonce = { ...unsignedTx, nonce };

      logger.info(
        '[ActivityService] :: Sending unsigned transaction to client',
        txWithNonce
      );
      return {
        tx: txWithNonce,
        encryptedWallet: userWallet.encryptedWallet
      };
    } catch (error) {
      logger.info(`[ActivityService] :: Blockchain error :: ${error}`);
      throw new COAError(error);
    }
  },

  /**
   * Get evidences by task
   *
   * @param {number} taskId
   * @returns transferId || error
   */
  async getTaskEvidences({ taskId }) {
    logger.info('[ActivityService] :: Entering getTaskEvidences method');
    validateRequiredParams({
      method: 'getTaskEvidences',
      params: { taskId }
    });

    await checkExistence(this.activityDao, taskId, 'task');
    logger.info('[ActivityService] :: Getting evidences for task', taskId);
    const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(taskId);
    if (!evidences) {
      logger.info('[ActivityService] :: No evidences found for task', taskId);
      return [];
    }
    logger.info(
      `[ActivityService] :: Found ${
        evidences.length
      } evidences for task ${taskId}`
    );

    const evidencesWithLink = evidences.map(evidence => ({
      ...evidence,
      txLink: evidence.txHash ? buildTxURL(evidence.txHash) : undefined
    }));
    return evidencesWithLink;
  },

  /**
   * Returns true or false whether a task
   * has a verified evidence or not
   *
   * @param {number} taskId
   * @returns {Promise<boolean>}
   */
  async isTaskVerified(taskId) {
    try {
      // TODO: this should check the blockchain
      logger.info('[ActivityService] :: Entering isTaskVerified method');
      validateRequiredParams({
        method: 'isTaskVerified',
        params: { taskId }
      });
      const evidences = await this.getTaskEvidences({ taskId });
      if (!evidences || evidences.length === 0) return false;
      return evidences.some(evidence => !!evidence.approved);
    } catch (error) {
      logger.error(
        '[ActivityService] :: There was an error checking if task is verified',
        error
      );
      return false;
    }
  },

  /**
   * Returns the blockchain information for the specified evidence
   * @param {number} evidenceId
   */
  async getEvidenceBlockchainData(evidenceId) {
    logger.info(
      '[ActivityService] :: Entering getEvidenceBlockchainData method'
    );
    const evidence = await checkExistence(
      this.taskEvidenceDao,
      evidenceId,
      'task_evidence'
    );

    const { txHash, proof } = evidence;

    if (!txHash) {
      logger.info(
        `[ActivityService] :: Evidence ${evidenceId} does not have blockchain information`
      );
      throw new COAError(
        errors.task.EvidenceBlockchainInfoNotFound(evidenceId)
      );
    }

    logger.info(
      `[ActivityService] :: Getting transaction response for ${txHash}`
    );
    const txResponse = await coa.getTransactionResponse(txHash);
    // not sure if this is necessary
    if (!txResponse) {
      logger.info(
        `[ActivityService] :: Evidence ${evidenceId} does not have blockchain information`
      );
      throw new COAError(
        errors.task.EvidenceBlockchainInfoNotFound(evidenceId)
      );
    }
    const { blockNumber, from } = txResponse;

    let oracleName;
    try {
      const oracle = await this.userService.getUserByAddress(from);
      oracleName = `${oracle.firstName} ${oracle.lastName}`;
    } catch (error) {
      logger.error('[ActivityService] :: Oracle not found');
    }

    let timestamp;
    const secondsConversion = 1000;
    if (blockNumber) {
      const block = await coa.getBlock(blockNumber);
      ({ timestamp } = block);
    }

    return {
      oracle: {
        oracleName,
        oracleAddress: from,
        oracleAddressUrl: from ? buildAddressURL(from) : undefined
      },
      txHash,
      txHashUrl: txHash ? buildTxURL(txHash) : undefined,
      creationDate: timestamp
        ? new Date(timestamp * secondsConversion)
        : undefined,
      blockNumber,
      blockNumberUrl: blockNumber ? buildBlockURL(blockNumber) : undefined,
      proof
    };
  },

  /**
   * Updates the tx status of an evidence
   *
   * @param {number} id
   * @param {String} status
   */
  async updateEvidenceStatusByTxHash(txHash, status) {
    logger.info(
      '[ActivityService] :: Entering updateEvidenceStatusByTxHash method'
    );
    validateRequiredParams({
      method: 'updateEvidenceStatusByTxHash',
      params: { txHash, status }
    });

    const evidence = await this.taskEvidenceDao.findByTxHash(txHash);
    if (!evidence) {
      logger.error(
        `[ActivityService] :: Evidence with txHash ${txHash} could not be found`
      );
      throw new COAError(
        errors.common.CantFindModelWithTxHash('task_evidence', txHash)
      );
    }

    if (!Object.values(txEvidenceStatus).includes(status)) {
      logger.error(
        `[ActivityService] :: Evidence status '${status}' is not valid`
      );
      throw new COAError(errors.task.EvidenceStatusNotValid(status));
    }

    if (
      [txEvidenceStatus.CONFIRMED, txEvidenceStatus.FAILED].includes(
        evidence.status
      )
    ) {
      logger.error('[ActivityService] :: Evidence status cannot be changed', {
        id: evidence.id,
        status: evidence.status
      });
      throw new COAError(
        errors.task.EvidenceStatusCannotChange(evidence.status)
      );
    }

    logger.info(
      `[ActivityService] :: Updating evidence ${
        evidence.id
      } to status ${status}`
    );
    const updated = await this.taskEvidenceDao.updateTaskEvidence(evidence.id, {
      status
    });
    return { evidenceId: updated.id };
  },
  /**
   * Checks all evidence transactions and
   * updates their status to the ones that failed.
   *
   * Returns an array with all failed evidence ids
   *
   */
  async updateFailedEvidenceTransactions() {
    logger.info(
      '[ActivityService] :: Entering updateFailedEvidenceTransactions method'
    );
    const sentTxs = await this.taskEvidenceDao.findAllSentTxs();
    logger.info(
      `[ActivityService] :: Found ${sentTxs.length} sent transactions`
    );
    const updated = await Promise.all(
      sentTxs.map(async ({ txHash }) => {
        const hasFailed = await this.transactionService.hasFailed(txHash);
        if (hasFailed) {
          try {
            const { evidenceId } = await this.updateEvidenceStatusByTxHash(
              txHash,
              txEvidenceStatus.FAILED
            );
            return evidenceId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              `[ActivityService] :: Couldn't update failed transaction status ${txHash}`,
              error
            );
          }
        }
      })
    );
    const failed = updated.filter(tx => !!tx);
    if (failed.length > 0) {
      logger.info(
        `[ActivityService] :: Updated status to ${
          txEvidenceStatus.FAILED
        } for evidences ${failed}`
      );
    } else {
      logger.info('[ActivityService] :: No failed transactions found');
    }
    return failed;
  },
  /**
   * Checks all evidence transactions and
   * update to verified if transfer has not failed
   * after a specified number of blocks
   *
   * Returns an array with all verified evidence ids
   *
   */
  async updateVerifiedEvidenceTransactions(currentBlockNumber) {
    logger.info(
      '[ActivityService] :: Entering updateVerifiedEvidenceTransactions method'
    );
    const txs = await this.taskEvidenceDao.findAllPendingVerificationTxs();
    logger.info(
      `[ActivityService] :: Found ${
        txs.length
      } pending of verification transactions`
    );
    const updated = await Promise.all(
      txs.map(async ({ id, txHash }) => {
        if (!txHash) {
          logger.error(`[TransferService] :: Evidence ${id} has not txHash`);
          return;
        }
        const { blockNumber } = await coa.getTransactionResponse(txHash);
        const hasVerified = await this.transactionService.hasVerified(
          blockNumber,
          currentBlockNumber
        );
        if (hasVerified) {
          try {
            const { evidenceId } = await this.updateEvidenceStatusByTxHash(
              txHash,
              txEvidenceStatus.CONFIRMED
            );
            return evidenceId;
          } catch (error) {
            // if fails proceed to the next one
            logger.error(
              `[ActivityService] :: Couldn't update confirmed transaction status ${txHash}`,
              error
            );
          }
        }
      })
    );
    const confirmed = updated.filter(tx => !!tx);
    if (confirmed.length > 0) {
      logger.info(
        `[ActivityService] :: Updated status to ${
          txEvidenceStatus.CONFIRMED
        } for evidences ${confirmed}`
      );
    } else {
      logger.info('[ActivityService] :: No confirmed transactions found');
    }
    return updated;
  },

  /**
   * Sends the signed transaction to the blockchain
   * and saves the evidence in the database
   *
   * @param {Number} taskId
   * @param {Number} userId
   * @param {File} file
   * @param {String} description
   * @param {Boolean} approved
   * @param {Transaction} signedTransaction
   */
  async addEvidence({
    activityId,
    userId,
    title,
    description,
    type,
    amount,
    transferTxHash,
    files
  }) {
    logger.info('[ActivityService] :: Entering addEvidence method');
    const method = 'addEvidence';
    validateRequiredParams({
      method,
      params: {
        activityId,
        userId,
        title,
        description,
        type
      }
    });

    const activity = await checkExistence(
      this.activityDao,
      activityId,
      'activity'
    );

    if (
      [ACTIVITY_STATUS.APPROVED, ACTIVITY_STATUS.IN_REVIEW].includes(
        activity.status
      )
    ) {
      logger.info(
        `[ActivityService] :: Can't add evidences to an activity with status ${[
          ACTIVITY_STATUS.APPROVED,
          ACTIVITY_STATUS.IN_REVIEW
        ]}`
      );
      throw new COAError(
        errors.task.ActivityIsApprovedOrInProgress(activity.status)
      );
    }

    const evidenceType = type.toLowerCase();

    this.validateEvidenceType(evidenceType);

    const milestone = await this.getMilestoneFromActivityId(activityId);

    const project = await this.projectService.getProjectById(milestone.project);

    const currencyType = project.currencyType.toLowerCase();

    if (evidenceType === evidenceTypes.IMPACT) {
      validateRequiredParams({
        method,
        params: {
          files
        }
      });

      this.validateFiles(files);
    } else if (currencyType === currencyTypes.FIAT) {
      validateRequiredParams({
        method,
        params: {
          amount,
          files
        }
      });
      this.validateFiles(files);
    } else {
      validateRequiredParams({
        method,
        params: {
          amount,
          transferTxHash
        }
      });
    }

    await this.validateUserWithRoleInProject({
      user: userId,
      descriptionRoles: [rolesTypes.BENEFICIARY, rolesTypes.FOUNDER],
      project: project.id,
      error: errors.task.UserIsNotBeneficiaryOrFounderInProject({
        userId,
        activityId,
        projectId: project.id
      })
    });

    this.validateStatusToUploadEvidence({ status: project.status });

    try {
      let savedFiles = [];
      if (
        files &&
        !(
          evidenceType === evidenceTypes.TRANSFER &&
          currencyType === currencyTypes.CRYPTO
        )
      ) {
        savedFiles = await Promise.all(
          Object.values(files).map(async file => {
            const path = await fileUtils.saveFile(EVIDENCE_TYPE, file);
            return this.fileService.saveFile({
              path,
              name: file.name,
              size: file.size,
              hash: file.md5
            });
          })
        );
      }

      const initIncomeOutcome = { income: '0', outcome: '0' };

      const assignedAmount =
        !amount || amount === '0'
          ? initIncomeOutcome
          : this.assignAmountToIncomeOrOutcome(amount);

      const evidence = {
        title,
        description,
        activity: activityId,
        type: evidenceType,
        ...assignedAmount
      };

      logger.info('[ActivityService] :: Saving evidence in database', {
        ...evidence,
        transferTxHash
      });

      const evidenceTransferCrypto = { ...evidence, transferTxHash };

      const taskEvidences = await this.taskEvidenceDao.getEvidencesByTaskId(
        activity.id
      );
      if (taskEvidences.length === 0) {
        logger.info(
          '[ActivityService] :: Setting activity status to ',
          ACTIVITY_STATUS.IN_PROGRESS
        );
        const milestoneActivities = await this.activityDao.getTasksByMilestone(
          milestone.id
        );
        if (
          milestoneActivities.every(
            _activity => _activity.status === ACTIVITY_STATUS.NEW
          )
        ) {
          logger.info(
            `[ActivityService] :: About to update milestone status to ${
              MILESTONE_STATUS.IN_PROGRESS
            }`
          );
          await this.milestoneDao.updateMilestone(
            { status: MILESTONE_STATUS.IN_PROGRESS },
            milestone.id
          );
        }
        await this.activityDao.updateActivity(
          { status: ACTIVITY_STATUS.IN_PROGRESS },
          activity.id
        );
      }
      const evidenceCreated = await this.taskEvidenceDao.addTaskEvidence(
        currencyType === currencyTypes.CRYPTO
          ? evidenceTransferCrypto
          : evidence
      );

      await Promise.all(
        savedFiles.map(async file =>
          this.evidenceFileService.saveEvidenceFile({
            evidence: evidenceCreated.id,
            file: file.id
          })
        )
      );

      await this.projectService.updateProject(project.id, {
        status: projectStatuses.IN_PROGRESS
      });

      const response = { evidenceId: evidenceCreated.id };

      return response;
    } catch (error) {
      logger.info(
        `[ActivityService] :: Occurs an error trying to save evidence :: ${error}`
      );
      throw new COAError(error);
    }
  },

  validateEvidenceType(type) {
    if (!Object.values(evidenceTypes).includes(type)) {
      logger.error('[ActivityService] :: Invalid evidence type');
      throw new COAError(errors.task.InvalidEvidenceType(type));
    }
  },

  validateFiles(files) {
    Object.values(files).forEach(file => {
      validateMtype(EVIDENCE_TYPE, file);
      validateFileSize(file);
    });
  },

  validateStatusToUploadEvidence({ status }) {
    if (
      status !== projectStatuses.PUBLISHED &&
      status !== projectStatuses.IN_PROGRESS
    ) {
      logger.error(
        `[ActivityService] :: Can't upload evidence when project is in ${status} status`
      );
      throw new COAError(errors.project.InvalidStatusForEvidenceUpload(status));
    }
  },

  async validateUserWithRoleInProject({
    user,
    descriptionRoles,
    project,
    error
  }) {
    logger.info(
      '[ActivityService] :: Entering validateUserWithRoleIsInProject method'
    );

    const roles = await this.roleService.getRolesByDescriptionIn(
      descriptionRoles
    );

    const result = await this.userProjectDao.findUserProject({
      user,
      project,
      role: { in: roles.map(role => role.id) }
    });

    if (!result) throw new COAError(error);
  },

  assignAmountToIncomeOrOutcome(amount) {
    const income = { income: amount, outcome: '0' };
    const outcome = { income: '0', outcome: removeMinusSign(amount) };
    return BigNumber(amount).isGreaterThan(0) ? income : outcome;
  },

  /**
   * Returns the milestone that the activity belongs to or `undefined`
   *
   * Throws an error if the activity does not exist
   *
   * @param {number} id
   * @returns milestone
   */
  async getMilestoneFromActivityId(activityId) {
    logger.info(
      '[ActivityService] :: Entering getMilestoneFromActivityId method'
    );
    const activity = await checkExistence(
      this.activityDao,
      activityId,
      'activity'
    );
    logger.info(
      `[ActivityService] :: Found activity ${activity.id} of milestone ${
        activity.milestone
      }`
    );

    const milestone = await this.milestoneService.getMilestoneById(
      activity.milestone
    );
    if (!milestone) {
      logger.info(
        `[ActivityService] :: No milestone found for activity ${activityId}`
      );
      throw new COAError(errors.task.MilestoneNotFound(activityId));
    }

    return milestone;
  },

  async updateEvidenceStatus({ evidenceId, newStatus, userId, reason }) {
    logger.info('[ActivityService] :: Entering updateEvidenceStatus method');
    const evidence = await checkExistence(
      this.taskEvidenceDao,
      evidenceId,
      'evidence'
    );
    if (!validStatusToChange.includes(newStatus)) {
      logger.info(`[ActivityService] :: given status is invalid ${newStatus}`);
      throw new COAError(errors.task.EvidenceStatusNotValid(newStatus));
    }
    if (evidence.status !== evidenceStatus.NEW) {
      logger.info(
        `[ActivityService] :: Evidence with status ${
          evidence.status
        } can not be updated`
      );
      throw new COAError(
        errors.task.EvidenceStatusCannotChange(evidence.status)
      );
    }
    logger.info(
      '[ActivityService] :: About to get activity by id ',
      evidence.activity
    );
    const activity = await this.activityDao.getTaskByIdWithMilestone(
      evidence.activity.id
    );
    const evidenceProjectId = activity.milestone.project;
    logger.info(
      `[ActivityService] :: About to get role by description ${
        rolesTypes.AUDITOR
      }`
    );
    const auditorRole = await this.roleDao.getRoleByDescription(
      rolesTypes.AUDITOR
    );
    if (!auditorRole) {
      logger.error(
        '[ActivityService] :: there was an error getting role ',
        rolesTypes.AUDITOR
      );
      throw new COAError(errors.common.ErrorGetting('role'));
    }
    logger.info('[ActivityService] :: About to get user project ', {
      role: auditorRole.id,
      user: userId,
      project: evidenceProjectId
    });
    const userProject = await this.userProjectDao.findUserProject({
      role: auditorRole.id,
      user: userId,
      project: evidenceProjectId
    });
    if (!userProject) {
      logger.info(
        '[ActivityService] :: User does not have an auditor role for this activity'
      );
      throw new COAError(errors.task.UserCantUpdateEvidence);
    }
    if (activity.auditor !== userId) {
      logger.info(
        '[ActivityService] :: User is not an auditor of this activity'
      );
      throw new COAError(errors.task.UserIsNotActivityAuditor);
    }
    let toUpdate = { status: newStatus, auditor: userId };
    if (newStatus === ACTIVITY_STATUS.REJECTED && reason)
      toUpdate = { ...toUpdate, reason };
    logger.info(
      `[ActivityService] :: About to update evidence with ${JSON.stringify(
        toUpdate
      )}`
    );
    const updated = await this.taskEvidenceDao.updateTaskEvidence(
      evidenceId,
      toUpdate
    );
    if (!updated) {
      logger.info('[ActivityService] :: Task evidence could not be updated');
      throw new COAError(errors.task.EvidenceUpdateError);
    }
    if (
      newStatus === evidenceStatus.APPROVED &&
      updated.type === evidenceTypes.TRANSFER
    ) {
      logger.info(
        '[ActivityService] :: Update task deposited and spent fields'
      );
      const deposited = BigNumber(activity.deposited)
        .plus(updated.income)
        .toString();
      const spent = BigNumber(activity.spent)
        .plus(updated.outcome)
        .toString();
      await this.activityDao.updateActivity({ deposited, spent }, activity.id);
    }
    const toReturn = { success: !!updated };
    return toReturn;
  },

  async createActivityFile({ taskId, userId }) {
    logger.info(
      '[ActivityService] :: About to create activity file for activity with id ',
      taskId
    );
    const activity = await checkExistence(
      this.activityDao,
      taskId,
      'activity',
      this.activityDao.getTaskByIdWithMilestone(taskId)
    );
    await this.userProjectService.getUserProjectFromRoleDescription({
      projectId: activity.milestone.project,
      roleDescription: rolesTypes.BENEFICIARY,
      userId
    });
    if (activity.status !== ACTIVITY_STATUS.NEW) {
      logger.error(
        '[ActivityService] :: Current activity status is not ',
        ACTIVITY_STATUS.NEW
      );
      throw new COAError(errors.task.InvalidRequiredStatus);
    }
    logger.info('[ActivityService] :: About to obtain evidences');
    const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(taskId);
    logger.info('[ActivityService] :: About to create activity file');
    const activityFile = { ...activity, evidences };
    await filesUtil.saveActivityFile({
      taskId,
      data: { ...activityFile }
    });
  },

  async updateActivityStatus({ activityId, userId, status, txId, reason }) {
    logger.info('[ActivityService] :: About to update activity status');
    const activity = await checkExistence(
      this.activityDao,
      activityId,
      'activity',
      this.activityDao.getTaskByIdWithMilestone(activityId)
    );
    if (!Object.values(ACTIVITY_STATUS).includes(status)) {
      logger.error('[ActivityService] :: Given status is invalid ', status);
      throw new COAError(errors.task.InvalidStatus(status));
    }
    if (!ACTIVITY_STATUS_TRANSITION[activity.status].includes(status)) {
      logger.error('[ActivityService] :: Status transition is not valid');
      throw new COAError(errors.task.InvalidStatusTransition);
    }
    if (status === ACTIVITY_STATUS.IN_REVIEW) {
      await this.userProjectService.getUserProjectFromRoleDescription({
        projectId: activity.milestone.project,
        roleDescription: rolesTypes.BENEFICIARY,
        userId
      });
    }
    if ([ACTIVITY_STATUS.APPROVED, ACTIVITY_STATUS.REJECTED].includes(status)) {
      await this.userProjectService.getUserProjectFromRoleDescription({
        projectId: activity.milestone.project,
        roleDescription: rolesTypes.AUDITOR,
        userId
      });
      const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(
        activity.id
      );
      if (
        !evidences.length ||
        !evidences.every(evidence =>
          lastEvidenceStatus.includes(evidence.status)
        )
      ) {
        logger.error(
          '[ActivityService] :: Not all of the evidences are rejected or approved'
        );
        throw new COAError(errors.task.TaskNotReady);
      }
    }
    if (!txId) {
      logger.error(
        '[ActivityService] :: transaction id is missing to update activity status'
      );
      throw new COAError(errors.task.MissingTransactionId);
    }
    const created = await this.txActivityDao.createTxActivity({
      transactionHash: txId,
      activity: activity.id
    });
    if (!created) {
      logger.error('[ActivityService] :: error creating transaction activity');
      throw new COAError(errors.task.TxActivityCreateError);
    }
    let toUpdate = { status };
    if (status === ACTIVITY_STATUS.REJECTED && reason)
      toUpdate = { ...toUpdate, reason };
    logger.info(
      `[ActivityService] :: About to update activity with ${JSON.stringify(
        toUpdate
      )}`
    );
    const updated = await this.activityDao.updateActivity(
      toUpdate,
      activity.id
    );
    if (status === ACTIVITY_STATUS.APPROVED) {
      const milestoneActivities = await this.activityDao.getTasksByMilestone(
        activity.milestone.id
      );
      if (
        milestoneActivities.every(
          _activity => _activity.status === ACTIVITY_STATUS.APPROVED
        )
      ) {
        logger.info(
          `[ActivityService] :: About to upload milestone status to ${
            MILESTONE_STATUS.APPROVED
          }`
        );
        await this.milestoneDao.updateMilestone(
          { status: MILESTONE_STATUS.APPROVED },
          activity.milestone.id
        );
      }
      const activityFile = utilFiles.getFileFromPath(
        `${filesUtil.currentWorkingDir}/activities/${activity.id}.json`
      );

      logger.info('[ActivityService] :: About to store activity file');
      await this.storageService.saveStorageData({
        data: JSON.stringify(activityFile)
      });
    }
    if (!updated) {
      logger.error(
        '[ActivityService] :: Activity couldnt be updated successfully'
      );
      throw new COAError(errors.task.ActivityStatusCantBeUpdated);
    }
    const toReturn = { success: !!updated };
    return toReturn;
  },

  async getActivityEvidences({ activityId, user }) {
    logger.info('[ActivityService] :: Entering getActivityEvidences method');
    validateRequiredParams({
      method: 'getTaskEvidences',
      params: { activityId }
    });

    await checkExistence(this.activityDao, activityId, 'activity');
    logger.info(
      '[ActivityService] :: Getting evidences for activity',
      activityId
    );
    const evidences = await this.taskEvidenceDao.getEvidencesByActivityId(
      activityId
    );
    logger.info(
      `[ActivityService] :: Found ${
        evidences.length
      } evidences for activity ${activityId}`
    );
    const evidencesWithFiles = await Promise.all(
      evidences.map(async evidence => ({
        ...evidence,
        files: await Promise.all(
          evidence.files.map(evidenceFile =>
            this.fileService.getFileById(evidenceFile.file)
          )
        )
      }))
    );
    return user
      ? { evidences: evidencesWithFiles }
      : {
          evidences: evidencesWithFiles.filter(
            evidence => evidence.status === evidenceStatus.APPROVED
          )
        };
  },
  async getEvidenceById(evidenceId) {
    logger.info('[ActivityService] :: Entering getEvidenceById method');
    await checkExistence(this.taskEvidenceDao, evidenceId, 'evidence');
    logger.info('[ActivityService] :: Getting evidence with id ', evidenceId);
    const evidence = await this.taskEvidenceDao.findById(evidenceId);
    return evidence;
  },

  async getEvidence(evidenceId) {
    logger.info('[ActivityService] :: Entering getEvidence method');
    const evidence = await this.getEvidenceById(evidenceId);

    const milestone = await this.milestoneService.getMilestoneById(
      evidence.activity.milestone
    );

    const beneficiary = await this.userProjectService.getBeneficiaryByProjectId(
      { projectId: milestone.project }
    );

    const project = await this.projectService.getProjectById(milestone.project);

    const files = await Promise.all(
      evidence.files.map(evidenceFile =>
        this.fileService.getFileById(evidenceFile.file)
      )
    );

    const auditor = evidence.auditor
      ? {
          id: evidence.auditor.id,
          firstName: evidence.auditor.firstName,
          lastName: evidence.auditor.lastName
        }
      : null;

    return {
      ...evidence,
      currency: project.currency,
      activity: {
        id: evidence.activity.id,
        title: evidence.activity.title
      },
      milestone: {
        id: milestone.id,
        title: milestone.title
      },
      auditor,
      beneficiary,
      files
    };
  }
};
