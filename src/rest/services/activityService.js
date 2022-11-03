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
const files = require('../util/files');
const { forEachPromise } = require('../util/promises');
const {
  projectStatuses,
  userRoles,
  txEvidenceStatus,
  rolesTypes
} = require('../util/constants');
const { sha3 } = require('../util/hash');

const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const { completeStep } = require('./helpers/dataCompleteUtil');
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

module.exports = {
  readFile: promisify(fs.readFile),
  /**
   * Updates an existing task.
   * Returns an object with the id of the updated task
   *
   * @param {number} taskId task identifier
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} taskParams task fields to update
   * @returns { {taskId: number} } id of updated task
   */
  async updateTask(taskId, { userId, taskParams }) {
    logger.info('[ActivityService] :: Entering updateTask method');
    validateRequiredParams({
      method: 'updateTask',
      params: { userId, taskId, taskParams }
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

    // if the task exists this shouldn't happen
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${task.milestone}`
      );
      throw new COAError(errors.task.ProjectNotFound(taskId));
    }

    validateOwnership(project.owner, userId);

    const allowEditStatuses = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];

    if (!allowEditStatuses.includes(project.status)) {
      logger.error(
        `[ActivityService] :: It can't update an activity when the project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.task.UpdateWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for editing?

    logger.info(`[ActivityService] :: Updating task of id ${taskId}`);
    const updatedTask = await this.activityDao.updateActivity(
      taskParams,
      taskId
    );

    if (taskParams.budget) {
      const actualBudget = Number(task.budget);
      const newBudget = Number(taskParams.budget);
      const difference = newBudget - actualBudget;
      if (difference !== 0) {
        const newGoalAmount = Number(project.goalAmount) + difference;
        logger.info(
          `[ActivityService] :: Updating project ${
            project.id
          } goalAmount to ${newGoalAmount}`
        );
        await this.projectService.updateProject(project.id, {
          goalAmount: newGoalAmount
        });
      }
    }

    logger.info(`[ActivityService] :: Task of id ${updatedTask.id} updated`);
    return { taskId: updatedTask.id };
  },
  /**
   * Deletes an existing task.
   * Returns an object with the id of the deleted task
   *
   * @param {number} taskId task identifier
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @returns { {taskId: number} } id of deleted task
   */
  async deleteTask(taskId, userId) {
    logger.info('[ActivityService] :: Entering deleteTask method');
    validateRequiredParams({
      method: 'deleteTask',
      params: { taskId, userId }
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

    // if the task exists this shouldn't happen
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${task.milestone}`
      );
      throw new COAError(errors.task.ProjectNotFound(taskId));
    }

    validateOwnership(project.owner, userId);

    const allowEditStatuses = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];

    if (!allowEditStatuses.includes(project.status)) {
      logger.error(
        `[ActivityService] :: It can't delete a milestone when the project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.task.DeleteWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for deleting?

    logger.info(`[ActivityService] :: Deleting task of id ${taskId}`);
    const deletedTask = await this.activityDao.deleteActivity(taskId);
    logger.info(`[ActivityService] :: Task of id ${deletedTask.id} deleted`);

    const taskBudget = Number(task.budget);
    const newGoalAmount = Number(project.goalAmount) - taskBudget;
    logger.info(
      `[ActivityService] :: Updating project ${
        project.id
      } goalAmount to ${newGoalAmount}`
    );
    await this.projectService.updateProject(project.id, {
      goalAmount: newGoalAmount
    });
    // if all activities of a milestone are deleted,
    // should the milestone be deleted as well?
    return { taskId: deletedTask.id };
  },
  /**
   * Creates an task for an existing Milestone.
   * Returns an object with the id of the new task
   *
   * @param {number} milestoneId
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} taskParams task data
   * @returns { {taskId: number} } id of updated task
   */
  async createActivity({
    milestoneId,
    title,
    description,
    acceptanceCriteria,
    budget,
    auditor
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
      `[ActivityService] :: Getting project of milestone ${milestoneId}`
    );
    const project = await this.milestoneService.getProjectFromMilestone(
      milestoneId
    );

    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${milestoneId}`
      );
      throw new COAError(errors.milestone.ProjectNotFound(milestoneId));
    }

    validateStatusToUpdate({
      status: project.status,
      error: errors.milestone.CreateWithInvalidProjectStatus
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
        step: 4
      })
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
      userId: auditor,
      projectId: project,
      roleId: auditorRole.id
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
      const filePath = await files.validateAndSaveFile(claimType, file);
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
    validatePhotoSize(file);
    const filePath = await files.getSaveFilePath(claimType, file);
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
  }
};
