/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { BigNumber } = require('bignumber.js');
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

  const newActivity = {
    title: 'Title',
    description: 'Description',
    acceptanceCriteria: 'Acceptance criteria',
    budget: '1000',
    auditor: 3
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

  const draftProject = {
    id: 10,
    status: projectStatuses.DRAFT,
    owner: 3,
    goalAmount: 5000,
    dataComplete: 1
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

  const newUdaptableTask = {
    id: 3,
    description: 'TaskDescription',
    reviewCriteria: 'TaskReview',
    category: 'TaskCategory',
    keyPersonnel: 'TaskPersonnel',
    budget: '5000',
    milestone: 10
  };

  const newUpdatableMilestone = {
    id: 10,
    project: draftProject.id,
    tasks: [newUdaptableTask]
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
    },
    getAllMilestonesByProject: projectId =>
      dbMilestone.filter(milestone => milestone.project === projectId)
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

  const userProjectDao = {
    findUserProject: jest.fn()
  };
  const roleDao = {
    getRoleByDescription: jest.fn()
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

  describe('Testing updateActivity', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService,
        roleDao,
        userProjectDao
      });
    });

    beforeEach(() => {
      dbProject.push(draftProject, executingProject);
      dbTask.push(
        { id: 10, ...newActivity, milestone: newUpdatableMilestone.id },
        nonUpdatableTask
      );
      dbMilestone.push(
        newUpdatableMilestone,
        updatableMilestone,
        nonUpdatableMilestone
      );
      dbUser.push(userEntrepreneur);
    });

    afterEach(() => jest.restoreAllMocks());

    afterAll(() => restoreActivityService());

    const activityToUpdate = {
      title: 'Updated title',
      description: 'Updated description',
      acceptanceCriteria: 'Updated acceptance criteria',
      budget: 1.5,
      auditor: 3
    };

    it('should update the activity and return its id', async () => {
      jest
        .spyOn(activityService, 'validateAuditorIsInProject')
        .mockImplementation();

      const response = await activityService.updateActivity({
        activityId: 10,
        ...activityToUpdate
      });
      expect(response).toEqual({ activityId: 10 });
      const updated = dbTask.find(
        activity => activity.id === response.activityId
      );
      expect(updated.title).toEqual(activityToUpdate.title);
      expect(updated.description).toEqual(activityToUpdate.description);
      expect(updated.acceptanceCriteria).toEqual(
        activityToUpdate.acceptanceCriteria
      );
      expect(
        BigNumber(updated.budget).eq(activityToUpdate.budget)
      ).toBeTruthy();
      expect(updated.auditor).toEqual(activityToUpdate.auditor);
    });

    it('should update the activity and update the goal amount project and return the activity id', async () => {
      const initialGoalAmount = BigNumber(1000);

      jest
        .spyOn(activityService, 'validateAuditorIsInProject')
        .mockImplementation();

      dbProject = [{ ...draftProject, goalAmount: initialGoalAmount }];
      const response = await activityService.updateActivity({
        activityId: 10,
        ...activityToUpdate,
        budget: '500'
      });
      const updatedActivity = dbTask.find(
        activity => activity.id === response.activityId
      );
      const updatedProject = dbProject.find(
        project => project.id === draftProject.id
      );
      expect(response).toEqual({ activityId: 10 });
      expect(updatedActivity.title).toEqual(activityToUpdate.title);
      expect(updatedActivity.description).toEqual(activityToUpdate.description);
      expect(updatedActivity.acceptanceCriteria).toEqual(
        activityToUpdate.acceptanceCriteria
      );
      expect(BigNumber(updatedProject.goalAmount).eq(500)).toBeTruthy();
    });

    it('should throw an error if a title is not received', async () => {
      const { title, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if a description is not received', async () => {
      const { description, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if a acceptanceCriteria is not received', async () => {
      const { acceptanceCriteria, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if a acceptanceCriteria is not received', async () => {
      const { acceptanceCriteria, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if a budget is not received', async () => {
      const { budget, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if a auditor is not received', async () => {
      const { auditor, ...rest } = newActivity;
      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateActivity'));
    });

    it('should throw an error if the project status is not valid', async () => {
      await expect(
        activityService.updateActivity({
          activityId: 2,
          ...newActivity
        })
      ).rejects.toThrow(
        errors.task.UpdateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });

    it('should throw an error if the auditor param received does not have auditor role in project', async () => {
      jest
        .spyOn(roleDao, 'getRoleByDescription')
        .mockImplementation(async () =>
          Promise.resolve({ id: 3, description: 'auditor' })
        );

      jest
        .spyOn(userProjectDao, 'findUserProject')
        .mockImplementation(async () => Promise.resolve(undefined));

      await expect(
        activityService.updateActivity({
          activityId: 10,
          ...newActivity
        })
      ).rejects.toThrow(
        errors.task.UserIsNotAuditorInProject(3, draftProject.id)
      );
    });
  });

  describe('Testing createActivity', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService,
        roleDao,
        userProjectDao
      });
    });

    beforeEach(() => {
      dbProject.push(draftProject, executingProject);
      dbMilestone.push(
        newUpdatableMilestone,
        updatableMilestone,
        nonUpdatableMilestone
      );
      dbUser.push(userEntrepreneur);
    });

    afterEach(() => jest.restoreAllMocks());

    afterAll(() => restoreActivityService());

    it('should create the activity and return its id', async () => {
      jest
        .spyOn(activityService, 'validateAuditorIsInProject')
        .mockImplementation();

      const response = await activityService.createActivity({
        milestoneId: newUpdatableMilestone.id,
        ...newActivity
      });
      const createdActivity = dbTask.find(
        task => task.id === response.activityId
      );
      expect(response).toHaveProperty('activityId');
      expect(response.activityId).toBeDefined();
      expect(createdActivity).toHaveProperty('id', response.activityId);
      expect(createdActivity).toHaveProperty(
        'milestone',
        newUpdatableMilestone.id
      );
      expect(createdActivity).toHaveProperty('title', 'Title');
      expect(createdActivity).toHaveProperty('description', 'Description');
      expect(createdActivity).toHaveProperty(
        'acceptanceCriteria',
        'Acceptance criteria'
      );
      expect(createdActivity).toHaveProperty('budget', '1000');
      expect(createdActivity).toHaveProperty('auditor', 3);
    });

    it('should create the activity, add the budget to the project goal amount and return the activity id', async () => {
      const initialGoalAmount = BigNumber(1000);

      jest
        .spyOn(activityService, 'validateAuditorIsInProject')
        .mockImplementation();

      dbProject = [{ ...draftProject, goalAmount: initialGoalAmount }];
      const response = await activityService.createActivity({
        milestoneId: newUpdatableMilestone.id,
        ...newActivity
      });
      const createdActivity = dbTask.find(
        task => task.id === response.activityId
      );
      const updatedProject = dbProject.find(
        project => project.id === draftProject.id
      );
      expect(createdActivity).toHaveProperty('title', 'Title');
      expect(createdActivity).toHaveProperty('description', 'Description');
      expect(createdActivity).toHaveProperty(
        'acceptanceCriteria',
        'Acceptance criteria'
      );
      expect(createdActivity).toHaveProperty('budget', '1000');
      expect(createdActivity).toHaveProperty('auditor', 3);
      expect(
        BigNumber(updatedProject.goalAmount).eq(
          initialGoalAmount.plus(newActivity.budget)
        )
      ).toBeTruthy();
    });

    it('should throw an error if a milestoneId is not received', async () => {
      await expect(
        activityService.createActivity({
          ...newActivity
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a title is not received', async () => {
      const { title, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a description is not received', async () => {
      const { description, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a acceptanceCriteria is not received', async () => {
      const { acceptanceCriteria, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a acceptanceCriteria is not received', async () => {
      const { acceptanceCriteria, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a budget is not received', async () => {
      const { budget, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if a auditor is not received', async () => {
      const { auditor, ...rest } = newActivity;
      await expect(
        activityService.createActivity({
          milestoneId: 1,
          ...rest
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createActivity'));
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        activityService.createActivity({
          milestoneId: 0,
          ...newActivity
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the project status is not valid', async () => {
      await expect(
        activityService.createActivity({
          milestoneId: nonUpdatableMilestone.id,
          ...newActivity
        })
      ).rejects.toThrow(
        errors.task.CreateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });

    it('should throw an error if the auditor param receveid does not have auditor role in project', async () => {
      jest
        .spyOn(roleDao, 'getRoleByDescription')
        .mockImplementation(async () =>
          Promise.resolve({ id: 3, description: 'auditor' })
        );

      jest
        .spyOn(userProjectDao, 'findUserProject')
        .mockImplementation(async () => Promise.resolve(undefined));

      await expect(
        activityService.createActivity({
          milestoneId: newUpdatableMilestone.id,
          ...newActivity
        })
      ).rejects.toThrow(
        errors.task.UserIsNotAuditorInProject(3, draftProject.id)
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

  describe('Testing deleteTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject, draftProject);
      dbTask.push(updatableTask, nonUpdatableTask, newUdaptableTask);
      dbMilestone.push(
        updatableMilestone,
        nonUpdatableMilestone,
        newUpdatableMilestone
      );
      dbUser.push(userEntrepreneur);
    });

    afterAll(() => restoreActivityService());
    it(
      'should delete the task, substract the budget from the project goal amount ' +
        'and return the task id',
      async () => {
        const updateProjectSpy = jest
          .spyOn(projectService, 'updateProject')
          .mockImplementation((_, fields) =>
            Promise.resolve({
              ...draftProject,
              ...fields
            })
          );
        const response = await activityService.deleteTask(newUdaptableTask.id);
        const updatedTask = dbTask.find(task => task.id === response.taskId);
        expect(response).toEqual({ taskId: newUdaptableTask.id });
        expect(updatedTask).toEqual(undefined);
        expect(updateProjectSpy).toHaveBeenCalledWith(draftProject.id, {
          goalAmount: `${draftProject.goalAmount - newUdaptableTask.budget}`
        });
      }
    );
    it('should throw an error if parameters are not valid', async () => {
      await expect(activityService.deleteTask()).rejects.toThrow(
        errors.common.RequiredParamsMissing('deleteTask')
      );
    });

    it('should throw an error if task does not exist', async () => {
      await expect(
        activityService.deleteTask(0, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if the project status is not DRAFT', async () => {
      await expect(
        activityService.deleteTask(nonUpdatableTask.id, userEntrepreneur.id)
      ).rejects.toThrow(
        errors.task.DeleteWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });
});
