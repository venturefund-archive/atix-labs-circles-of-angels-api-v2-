/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');
const files = require('../../rest/util/files');
const {
  projectStatuses,
  userRoles,
  txEvidenceStatus
} = require('../../rest/util/constants');
const { injectMocks } = require('../../rest/util/injection');
const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const originalActivityService = require('../../rest/services/activityService');
const validateMtype = require('../../rest/services/helpers/validateMtype');
const txExplorerHelper = require('../../rest/services/helpers/txExplorerHelper');
const validatePhotoSize = require('../../rest/services/helpers/validatePhotoSize');

let activityService = Object.assign({}, originalActivityService);
const restoreActivityService = () => {
  activityService = Object.assign({}, originalActivityService);
};

describe('Testing activityService', () => {
  let dbTask = [];
  let dbTaskEvidence = [];
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];

  const resetDb = () => {
    dbTask = [];
    dbTaskEvidence = [];
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
  };

  const evidenceFile = { name: 'evidence.jpg', size: 20000 };

  const mockedDescription = 'Testing description';

  const newTaskParams = {
    description: 'NewDescription',
    reviewCriteria: 'NewReviewCriteria',
    category: 'NewCategory',
    keyPersonnel: 'NewKeyPersonnel',
    budget: 5000
  };

  // USERS
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userSupporter = {
    id: 2,
    firstName: 'User',
    lastName: 'Supporter',
    role: userRoles.PROJECT_SUPPORTER
  };

  // PROJECTS
  const newProject = {
    id: 1,
    status: projectStatuses.NEW,
    owner: userEntrepreneur.id,
    goalAmount: 5000
  };

  const executingProject = {
    id: 2,
    status: projectStatuses.EXECUTING,
    owner: userEntrepreneur.id,
    goalAmount: 5000
  };

  // MILESTONES
  const updatableMilestone = {
    id: 1,
    project: newProject.id
  };

  const nonUpdatableMilestone = {
    id: 2,
    project: executingProject.id
  };

  // TASKS
  const updatableTask = {
    id: 1,
    description: 'TaskDescription',
    reviewCriteria: 'TaskReview',
    category: 'TaskCategory',
    keyPersonnel: 'TaskPersonnel',
    budget: '5000',
    milestone: updatableMilestone.id
  };

  const nonUpdatableTask = {
    id: 2,
    milestone: nonUpdatableMilestone.id
  };

  // EVIDENCES
  const taskEvidence = {
    id: 1,
    createdAt: '2020-02-13',
    description: mockedDescription,
    proof: '/file/taskEvidence',
    approved: true,
    task: nonUpdatableTask.id,
    txHash: '0x111',
    status: txEvidenceStatus.SENT
  };

  const taskEvidenceNotApproved = {
    id: 2,
    createdAt: '2020-02-13',
    description: mockedDescription,
    proof: '/file/taskEvidence',
    approved: false,
    task: nonUpdatableTask.id,
    txHash: '0x222'
  };

  const activityDao = {
    findById: id => dbTask.find(task => task.id === id),
    updateActivity: (params, activityId) => {
      const found = dbTask.find(task => task.id === activityId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbTask[dbTask.indexOf(found)] = updated;
      return updated;
    },
    deleteActivity: id => {
      const found = dbTask.find(task => task.id === id);
      if (!found) return;
      dbTask.splice(dbTask.indexOf(found), 1);
      return found;
    },
    saveActivity: (activity, milestoneId) => {
      const newTaskId =
        dbTask.length > 0 ? dbTask[dbTask.length - 1].id + 1 : 1;
      const newTask = {
        milestone: milestoneId,
        id: newTaskId,
        ...activity
      };
      dbTask.push(newTask);
      return newTask;
    },
    getTaskByIdWithMilestone: taskId => {
      const found = dbTask.find(task => task.id === taskId);
      if (!found) return;
      const populatedMilestone = dbMilestone.find(
        milestone => milestone.id === found.milestone
      );
      return {
        ...found,
        milestone: populatedMilestone
      };
    }
  };

  const taskEvidenceDao = {
    findById: id => dbTaskEvidence.find(evidence => evidence.id === id),
    findByTxHash: hash =>
      dbTaskEvidence.find(evidence => evidence.txHash === hash),
    addTaskEvidence: ({ description, proof, approved, task }) => {
      const newTaskEvidenceId =
        dbTaskEvidence.length > 0
          ? dbTaskEvidence[dbTaskEvidence.length - 1].id + 1
          : 1;

      const newTaskEvidence = {
        id: newTaskEvidenceId,
        task,
        description,
        proof,
        approved
      };

      dbTaskEvidence.push(newTaskEvidence);
      return newTaskEvidence;
    },
    getEvidencesByTaskId: taskId => {
      const evidences = dbTaskEvidence.filter(
        evidence => evidence.task === taskId
      );

      return evidences;
    },
    updateTaskEvidence: (id, { status }) => {
      const found = dbTaskEvidence.find(e => e.id === id);
      if (!found) return;
      const updated = { ...found, status };
      dbTaskEvidence[dbTaskEvidence.indexOf(found)] = updated;
      return updated;
    },
    findAllSentTxs: () =>
      dbTaskEvidence
        .filter(ev => ev.status === txEvidenceStatus.SENT)
        .map(({ id, txHash }) => ({ id, txHash }))
  };

  const milestoneService = {
    getProjectFromMilestone: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('milestone', id));
      return dbProject.find(project => project.id === found.project);
    }
  };

  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    },
    getUserByAddress: address => {
      const found = dbUser.find(user => user.address === address);
      if (!found)
        throw new COAError(
          errors.common.CantFindModelWithAddress('user', address)
        );
      return found;
    }
  };

  const projectService = {
    isOracleCandidate: jest.fn(),
    updateProject: (projectId, params) => {
      const found = dbProject.find(task => task.id === projectId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbProject[dbProject.indexOf(found)] = updated;
      return updated;
    },
    getProjectById: id => {
      const found = dbProject.find(project => project.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('project', id));
      return found;
    }
  };

  const transactionService = {
    getNextNonce: jest.fn(() => 0),
    save: jest.fn(),
    hasFailed: jest.fn(() => false)
  };

  beforeAll(() => {
    restoreActivityService();
    files.validateAndSaveFile = jest.fn((type, file) => {
      validateMtype(type, file);
      validatePhotoSize(file);
      return '/dir/path';
    });
    files.saveFile = jest.fn(() => '/dir/path');
    files.getSaveFilePath = jest.fn(() => '/dir/path');
    coa.sendNewTransaction = jest.fn();
    coa.getAddClaimTransaction = jest.fn();
    coa.getTransactionResponse = jest.fn(() => null);
    coa.getBlock = jest.fn();
  });

  beforeEach(() => resetDb());
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Testing updateTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbTask.push(updatableTask, nonUpdatableTask);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    afterAll(() => restoreActivityService());

    it('should update the task and return its id', async () => {
      const taskParams = {
        description: 'UpdatedDescription',
        category: 'UpdatedCategory'
      };
      const response = await activityService.updateTask(updatableTask.id, {
        userId: userEntrepreneur.id,
        taskParams
      });
      expect(response).toEqual({ taskId: updatableTask.id });
      const updated = dbTask.find(task => task.id === response.taskId);
      expect(updated.description).toEqual(taskParams.description);
      expect(updated.category).toEqual(taskParams.category);
    });

    it('should update the task budget, the project goal amount and return the task id', async () => {
      dbProject = [{ ...newProject, goalAmount: updatableTask.budget }];
      const taskParams = {
        budget: 1000
      };
      const response = await activityService.updateTask(updatableTask.id, {
        userId: userEntrepreneur.id,
        taskParams
      });
      expect(response).toEqual({ taskId: updatableTask.id });
      const updatedTask = dbTask.find(task => task.id === response.taskId);
      const updatedProject = dbProject.find(
        project => project.id === newProject.id
      );
      expect(updatedTask.budget).toEqual(taskParams.budget);
      expect(updatedProject.goalAmount).toEqual(taskParams.budget);
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        activityService.updateTask(updatableTask.id, {
          userId: userEntrepreneur.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateTask'));
    });

    it('should throw an error if task does not exist', async () => {
      await expect(
        activityService.updateTask(0, {
          userId: userEntrepreneur.id,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.updateTask(updatableTask.id, {
          userId: 0,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.updateTask(nonUpdatableTask.id, {
          userId: userEntrepreneur.id,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(
        errors.task.UpdateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing deleteTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbTask.push(updatableTask, nonUpdatableTask);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    afterAll(() => restoreActivityService());

    it(
      'should delete the task, substract the budget from the project goal amount ' +
        'and return the task id',
      async () => {
        dbProject = [{ ...newProject, goalAmount: 10000000 }];
        const response = await activityService.deleteTask(
          updatableTask.id,
          userEntrepreneur.id
        );
        const updatedTask = dbTask.find(task => task.id === response.taskId);
        const updatedProject = dbProject.find(
          project => project.id === newProject.id
        );
        expect(response).toEqual({ taskId: updatableTask.id });
        expect(updatedTask).toEqual(undefined);
        expect(updatedProject.goalAmount).toEqual(
          10000000 - updatableTask.budget
        );
      }
    );

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        activityService.deleteTask(updatableTask.id)
      ).rejects.toThrow(errors.common.RequiredParamsMissing('deleteTask'));
    });

    it('should throw an error if task does not exist', async () => {
      await expect(
        activityService.deleteTask(0, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.deleteTask(updatableTask.id, 0)
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.deleteTask(nonUpdatableTask.id, userEntrepreneur.id)
      ).rejects.toThrow(
        errors.task.DeleteWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing createTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    afterAll(() => restoreActivityService());

    it('should create the task and return its id', async () => {
      const response = await activityService.createTask(updatableMilestone.id, {
        userId: userEntrepreneur.id,
        taskParams: newTaskParams
      });
      const createdTask = dbTask.find(task => task.id === response.taskId);
      expect(response).toHaveProperty('taskId');
      expect(response.taskId).toBeDefined();
      expect(createdTask).toHaveProperty('id', response.taskId);
      expect(createdTask).toHaveProperty('milestone', updatableMilestone.id);
      expect(createdTask).toHaveProperty('description', 'NewDescription');
      expect(createdTask).toHaveProperty('reviewCriteria', 'NewReviewCriteria');
      expect(createdTask).toHaveProperty('category', 'NewCategory');
      expect(createdTask).toHaveProperty('keyPersonnel', 'NewKeyPersonnel');
      expect(createdTask).toHaveProperty('budget', 5000);
    });

    it(
      'should delete the task, add the budget to the project goal amount ' +
        'and return the task id',
      async () => {
        const initialGoalAmount = 1000;
        dbProject = [{ ...newProject, goalAmount: initialGoalAmount }];
        const response = await activityService.createTask(
          updatableMilestone.id,
          {
            userId: userEntrepreneur.id,
            taskParams: newTaskParams
          }
        );
        const createdTask = dbTask.find(task => task.id === response.taskId);
        const updatedProject = dbProject.find(
          project => project.id === newProject.id
        );
        expect(response).toHaveProperty('taskId');
        expect(response.taskId).toBeDefined();
        expect(createdTask).toHaveProperty('id', response.taskId);
        expect(createdTask).toHaveProperty('milestone', updatableMilestone.id);
        expect(createdTask).toHaveProperty('description', 'NewDescription');
        expect(createdTask).toHaveProperty(
          'reviewCriteria',
          'NewReviewCriteria'
        );
        expect(createdTask).toHaveProperty('category', 'NewCategory');
        expect(createdTask).toHaveProperty('keyPersonnel', 'NewKeyPersonnel');
        expect(createdTask).toHaveProperty('budget', 5000);
        expect(updatedProject.goalAmount).toEqual(
          initialGoalAmount + newTaskParams.budget
        );
      }
    );

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        activityService.createTask(updatableMilestone.id, {
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createTask'));
    });

    it('should throw an error if any mandatory task property is not defined', async () => {
      const missingTaskParams = {
        description: 'NewDescription',
        reviewCriteria: 'NewReviewCriteria'
      };
      await expect(
        activityService.createTask(updatableMilestone.id, {
          userId: userEntrepreneur.id,
          taskParams: missingTaskParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createTask'));
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        activityService.createTask(0, {
          userId: userEntrepreneur.id,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.createTask(updatableMilestone.id, {
          userId: 0,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.createTask(nonUpdatableMilestone.id, {
          userId: userEntrepreneur.id,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(
        errors.task.CreateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing sendAddClaimTransaction', () => {
    const signedTransaction = '0x11122233548979870';
    const userAddress = '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D';
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        taskEvidenceDao,
        projectService,
        transactionService
      });
    });

    beforeEach(async () => {
      dbUser.push(userEntrepreneur);
      dbTask.push({
        ...nonUpdatableTask,
        oracle: userEntrepreneur.id
      });
      dbMilestone.push(nonUpdatableMilestone);
      dbProject.push({
        ...executingProject,
        address: '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A'
      });
    });

    afterAll(() => restoreActivityService());

    it(
      'should send the signed tx to the contract, save the evidence ' +
        'and return its id',
      async () => {
        coa.sendNewTransaction.mockReturnValueOnce({
          hash: '0x148Ea11233'
        });
        const response = await activityService.sendAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: evidenceFile,
          description: mockedDescription,
          approved: true,
          signedTransaction,
          userAddress
        });
        const createdEvidence = dbTaskEvidence.find(
          evidence => evidence.task === nonUpdatableTask.id
        );
        expect(response).toEqual({ claimId: createdEvidence.id });
      }
    );
    it('should throw an error if any required param is missing', async () => {
      await expect(
        activityService.sendAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: evidenceFile
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendAddClaimTransaction')
      );
    });
    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.sendAddClaimTransaction({
          taskId: 0,
          userId: userEntrepreneur.id,
          file: evidenceFile,
          description: mockedDescription,
          approved: true,
          signedTransaction,
          userAddress
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });
    it('should throw an error if the project is not in executing status', async () => {
      dbTask.push(updatableTask);
      dbMilestone.push(updatableMilestone);
      dbProject.push(newProject);

      await expect(
        activityService.sendAddClaimTransaction({
          taskId: updatableTask.id,
          userId: userEntrepreneur.id,
          file: evidenceFile,
          description: 'description',
          approved: true,
          signedTransaction,
          userAddress
        })
      ).rejects.toThrow(
        errors.project.InvalidStatusForEvidenceUpload(newProject.status)
      );
    });
    it('should throw an error if the user is not the oracle assigned', async () => {
      await expect(
        activityService.sendAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          userId: 0,
          file: evidenceFile,
          description: mockedDescription,
          approved: true,
          signedTransaction,
          userAddress
        })
      ).rejects.toThrow(
        errors.task.OracleNotAssigned({
          userId: 0,
          taskId: nonUpdatableTask.id
        })
      );
    });
    it('should throw an error if the file mtype is invalid', async () => {
      await expect(
        activityService.sendAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: { name: 'invalidclaim.exe', size: 2000 },
          description: mockedDescription,
          approved: true,
          signedTransaction,
          userAddress
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });

    it('should throw an error if the file has an invalid size', async () => {
      await expect(
        activityService.sendAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: { name: 'imbig.jpg', size: 999999999999 },
          description: mockedDescription,
          approved: true,
          signedTransaction,
          userAddress
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
  });

  describe('Testing getAddClaimTransaction', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        taskEvidenceDao,
        projectService,
        transactionService
      });
    });

    beforeEach(async () => {
      dbUser.push(userEntrepreneur);
      dbTask.push({
        ...nonUpdatableTask,
        oracle: userEntrepreneur.id
      });
      dbMilestone.push(nonUpdatableMilestone);
      dbProject.push({
        ...executingProject,
        address: '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A'
      });
    });

    afterAll(() => restoreActivityService());

    it('should return the unsigned transaction and the encrypted user wallet', async () => {
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000,
        nonce: 0
      };
      coa.getAddClaimTransaction.mockReturnValueOnce(unsignedTx);
      const response = await activityService.getAddClaimTransaction({
        taskId: nonUpdatableTask.id,
        file: evidenceFile,
        approved: true,
        userWallet
      });
      expect(response.tx).toEqual(unsignedTx);
      expect(response.encryptedWallet).toEqual(userWallet.encryptedWallet);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        activityService.getAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getAddClaimTransaction')
      );
    });
    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.getAddClaimTransaction({
          taskId: 0,
          file: evidenceFile,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });
    it('should throw an error if the file mtype is invalid', async () => {
      await expect(
        activityService.getAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          file: { name: 'invalidclaim.exe', size: 2000 },
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });
    it('should throw an error if the file has an invalid size', async () => {
      await expect(
        activityService.getAddClaimTransaction({
          taskId: nonUpdatableTask.id,
          file: { name: 'imbig.jpg', size: 9999999999 },
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
  });

  describe('Testing getTaskEvidence', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        taskEvidenceDao
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur);
      dbTask.push({
        ...nonUpdatableTask,
        oracle: userEntrepreneur.id
      });
      dbTaskEvidence.push(taskEvidence);
    });

    afterAll(() => restoreActivityService());

    it('should return a list of all task evidences', async () => {
      const response = await activityService.getTaskEvidences({
        taskId: nonUpdatableTask.id
      });

      expect(response).toHaveLength(1);
      expect(response).toEqual([
        {
          ...taskEvidence,
          txLink: txExplorerHelper.buildTxURL(taskEvidence.txHash)
        }
      ]);
    });
  });

  describe('Testing assignOracle', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService,
        milestoneService
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur, userSupporter);
      dbProject.push({ ...newProject, status: projectStatuses.CONSENSUS });
      dbMilestone.push(updatableMilestone);
      dbTask.push(updatableTask);
    });

    afterAll(() => restoreActivityService());

    it(
      'should assign an oracle to an existing activity if the oracle ' +
        'applied as candidate for the project',
      async () => {
        projectService.isOracleCandidate.mockReturnValueOnce(true);
        const response = await activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        );
        const updated = dbTask.find(task => task.id === updatableTask.id);
        expect(response).toEqual({ taskId: updatableTask.id });
        expect(updated.oracle).toEqual(userSupporter.id);
      }
    );
    it('should throw an error if any of the required params is missing', async () => {
      await expect(
        activityService.assignOracle(updatableTask.id, userSupporter.id)
      ).rejects.toThrow(errors.common.RequiredParamsMissing('assignOracle'));
    });
    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.assignOracle(0, userSupporter.id, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });
    it("should throw an error if the user is not the task's project owner", async () => {
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userSupporter.id
        )
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });
    it('should throw an error if the oracle id does not belong to a supporter', async () => {
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userEntrepreneur.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(errors.user.IsNotSupporter);
    });
    it("should throw an error if the task's project is not in consensus phase", async () => {
      dbProject.push(executingProject);
      dbMilestone.push(nonUpdatableMilestone);
      dbTask.push(nonUpdatableTask);
      await expect(
        activityService.assignOracle(
          nonUpdatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(
        errors.task.AssignOracleWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
    it('should throw an error if the supporter has not applied as an oracle', async () => {
      projectService.isOracleCandidate.mockReturnValueOnce(false);
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(errors.task.NotOracleCandidate);
    });
  });

  describe('Testing createActivities', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject);
      dbMilestone.push(updatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    afterAll(() => restoreActivityService());

    it('should save all activities and return them', async () => {
      const newTask = {
        description: 'TaskDescription',
        reviewCriteria: 'TaskReview',
        category: 'TaskCategory',
        keyPersonnel: 'TaskPersonnel',
        budget: '5000'
      };
      const response = await activityService.createActivities(
        [newTask, newTask, newTask],
        updatableMilestone.id
      );
      expect(response).toHaveLength(3);
      const savedActivities = dbTask.filter(
        task => task.milestone === updatableMilestone.id
      );
      expect(response).toEqual(savedActivities);
    });

    it('should skip the empty activities and save and return the others', async () => {
      const newTask = {
        description: 'TaskDescription',
        reviewCriteria: 'TaskReview',
        category: 'TaskCategory',
        keyPersonnel: 'TaskPersonnel',
        budget: '5000'
      };
      const response = await activityService.createActivities(
        [
          newTask,
          {
            description: '',
            reviewCriteria: '',
            category: '',
            keyPersonnel: '',
            budget: ''
          },
          newTask
        ],
        updatableMilestone.id
      );
      expect(response).toHaveLength(2);
      const savedActivities = dbTask.filter(
        task => task.milestone === updatableMilestone.id
      );
      expect(response).toEqual(savedActivities);
    });

    it('should return an empty array if no activities were provided', async () => {
      const response = await activityService.createActivities(
        [],
        updatableMilestone.id
      );
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getMilestoneAndTaskFromId', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService
      });
    });

    beforeEach(() => {
      dbMilestone.push(updatableMilestone);
      dbTask.push(updatableTask);
    });

    afterAll(() => restoreActivityService());

    it('should return the task and the milestone it belongs to', async () => {
      const response = await activityService.getMilestoneAndTaskFromId(
        updatableTask.id
      );
      expect(response.task).toEqual(updatableTask);
      expect(response.milestone).toEqual(updatableMilestone);
    });

    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.getMilestoneAndTaskFromId(0)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if no milestone was found for the task', async () => {
      dbTask.push({ ...updatableTask, id: 2, milestone: 0 });
      await expect(
        activityService.getMilestoneAndTaskFromId(2)
      ).rejects.toThrow(errors.task.MilestoneNotFound(2));
    });
  });

  describe('Testing isTaskVerified', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        getTaskEvidences: jest.fn(({ taskId }) =>
          dbTaskEvidence.filter(evidence => evidence.task === taskId)
        )
      });
    });

    beforeEach(() => {
      dbTaskEvidence.push(taskEvidence, taskEvidenceNotApproved);
    });

    afterAll(() => restoreActivityService());

    it('should return true when a task has at least one verified evidence', async () => {
      await expect(
        activityService.isTaskVerified(nonUpdatableTask.id)
      ).resolves.toBe(true);
    });

    it('should return false when a task does not have any verified evidence', async () => {
      dbTaskEvidence = [taskEvidenceNotApproved];
      await expect(
        activityService.isTaskVerified(nonUpdatableTask.id)
      ).resolves.toBe(false);
    });

    it('should return false if any required param is missing', async () => {
      await expect(activityService.isTaskVerified()).resolves.toBe(false);
    });

    it('should return false if getTaskEvidences throws an error', async () => {
      activityService.getTaskEvidences.mockImplementationOnce(({ taskId }) => {
        throw new COAError(errors.common.CantFindModelWithId('task', taskId));
      });
      await expect(activityService.isTaskVerified(0)).resolves.toBe(false);
    });
  });

  describe('Testing getEvidenceBlockchainData method', () => {
    const oracleAddress = '0x123456789';
    const blockResponse = {
      timestamp: 1587146117347
    };
    const txResponse = {
      blockNumber: 10,
      from: oracleAddress
    };

    beforeAll(() => {
      injectMocks(activityService, {
        taskEvidenceDao,
        userService
      });
    });
    beforeEach(() => {
      dbUser.push({ ...userSupporter, address: oracleAddress });
      dbTaskEvidence.push(taskEvidence);
    });
    afterAll(() => restoreActivityService());

    it('should return the blockchain data of the evidence', async () => {
      coa.getBlock.mockReturnValueOnce(blockResponse);
      coa.getTransactionResponse.mockReturnValueOnce(txResponse);
      const response = await activityService.getEvidenceBlockchainData(
        taskEvidence.id
      );
      expect(response).toEqual({
        oracle: {
          oracleName: `${userSupporter.firstName} ${userSupporter.lastName}`,
          oracleAddress: txResponse.from,
          oracleAddressUrl: txExplorerHelper.buildAddressURL(txResponse.from)
        },
        txHash: taskEvidence.txHash,
        txHashUrl: txExplorerHelper.buildTxURL(taskEvidence.txHash),
        creationDate: new Date(blockResponse.timestamp * 1000),
        blockNumber: txResponse.blockNumber,
        blockNumberUrl: txExplorerHelper.buildBlockURL(txResponse.blockNumber),
        proof: taskEvidence.proof
      });
    });

    it('should throw an error if the evidence does not exist', async () => {
      await expect(
        activityService.getEvidenceBlockchainData(0)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task_evidence', 0));
    });

    it('should throw an error if the evidence does not have a txHash', async () => {
      dbTaskEvidence = [{ ...taskEvidence, txHash: undefined }];
      await expect(
        activityService.getEvidenceBlockchainData(taskEvidence.id)
      ).rejects.toThrow(
        errors.task.EvidenceBlockchainInfoNotFound(taskEvidence.id)
      );
    });

    it("should throw an error if the transaction doesn't exist", async () => {
      coa.getTransactionResponse.mockReturnValueOnce(null);
      await expect(
        activityService.getEvidenceBlockchainData(taskEvidence.id)
      ).rejects.toThrow(
        errors.task.EvidenceBlockchainInfoNotFound(taskEvidence.id)
      );
    });
  });

  describe('Testing updateEvidenceStatusByTxHash method', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        taskEvidenceDao
      });
    });
    beforeEach(() => {
      resetDb();
      dbTaskEvidence.push(taskEvidence);
    });
    afterAll(() => restoreActivityService());
    it('should update the evidence status and return its id', async () => {
      const response = await activityService.updateEvidenceStatusByTxHash(
        taskEvidence.txHash,
        txEvidenceStatus.CONFIRMED
      );
      expect(response).toEqual({ evidenceId: taskEvidence.id });
      const updated = dbTaskEvidence.find(ev => ev.id === response.evidenceId);
      expect(updated.status).toEqual(txEvidenceStatus.CONFIRMED);
    });
    it('should throw an error if any required param is missing', async () => {
      await expect(
        activityService.updateEvidenceStatusByTxHash(taskEvidence.txHash)
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('updateEvidenceStatusByTxHash')
      );
    });
    it('should throw an error if the evidence does not exist', async () => {
      await expect(
        activityService.updateEvidenceStatusByTxHash(
          '0x0',
          txEvidenceStatus.CONFIRMED
        )
      ).rejects.toThrow(
        errors.common.CantFindModelWithTxHash('task_evidence', '0x0')
      );
    });
    it('should throw an error if the status is not valid', async () => {
      await expect(
        activityService.updateEvidenceStatusByTxHash(
          taskEvidence.txHash,
          'wrong status'
        )
      ).rejects.toThrow(errors.task.EvidenceStatusNotValid('wrong status'));
    });
    it('should throw an error if the evidence status cannot be changed', async () => {
      dbTaskEvidence = [
        { ...taskEvidence, status: txEvidenceStatus.CONFIRMED }
      ];
      await expect(
        activityService.updateEvidenceStatusByTxHash(
          taskEvidence.txHash,
          txEvidenceStatus.FAILED
        )
      ).rejects.toThrow(
        errors.task.EvidenceStatusCannotChange(txEvidenceStatus.CONFIRMED)
      );
    });
  });

  describe('Testing updateFailedEvidenceTransactions method', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        transactionService,
        taskEvidenceDao
      });
    });
    beforeEach(() => {
      resetDb();
      dbTaskEvidence.push(taskEvidence);
    });
    afterAll(() => restoreActivityService());
    it('should update all failed evidences and return an array with their ids', async () => {
      transactionService.hasFailed.mockReturnValueOnce(true);
      const response = await activityService.updateFailedEvidenceTransactions();
      expect(response).toEqual([taskEvidence.id]);
      const updated = dbTaskEvidence.find(ev => ev.id === taskEvidence.id);
      expect(updated.status).toEqual(txEvidenceStatus.FAILED);
    });
    it('should return an empty array if no txs failed', async () => {
      transactionService.hasFailed.mockReturnValueOnce(false);
      const response = await activityService.updateFailedEvidenceTransactions();
      expect(response).toEqual([]);
    });
  });
});
