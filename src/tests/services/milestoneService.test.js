/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed upon
 * by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { run, coa } = require('hardhat');
const { injectMocks } = require('../../rest/util/injection');
const COAError = require('../../rest/errors/COAError');
const validateMtype = require('../../rest/services/helpers/validateMtype');
const validatePhotoSize = require('../../rest/services/helpers/validatePhotoSize');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const {
  projectStatuses,
  userRoles,
  claimMilestoneStatus,
  ACTION_TYPE
} = require('../../rest/util/constants');
const files = require('../../rest/util/files');
const originalMilestoneService = require('../../rest/services/milestoneService');
const originalUserServiceProject = require('../../rest/services/userProjectService');

let milestoneService = Object.assign({}, originalMilestoneService);
const restoreMilestoneService = () => {
  milestoneService = Object.assign({}, originalMilestoneService);
};

const deployContracts = async () => {
  await run('deploy', { resetStates: true });
  const coaContract = await coa.getCOA();
  const { _address } = await coa.getSigner();
  return { coaContract, superUserAddress: _address };
};

describe('Testing milestoneService', () => {
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];
  let dbTask = [];
  let dbEvidence = [];
  const resetDb = () => {
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
    dbTask = [];
    dbEvidence = [];
  };

  const ALL_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const newMilestoneParams = {
    title: 'NewTitle',
    description: 'NewDescription'
  };

  const imgFile = { name: 'file.jpeg', size: 12345, md5: 'a1b2cd12' };

  // USERS
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userBankoperator = {
    id: 2,
    role: userRoles.BANK_OPERATOR
  };

  const userSupporter = {
    id: 3,
    address: ALL_ZERO_ADDRESS,
    role: userRoles.PROJECT_SUPPORTER
  };

  const adminUser = {
    id: 4,
    isAdmin: true
  };

  const regularUser = {
    id: 4,
    isAdmin: false
  };

  // PROJECTS

  const draftProject = {
    id: 10,
    status: projectStatuses.DRAFT,
    owner: userEntrepreneur.id,
    revision: 1
  };

  const newProject = {
    id: 1,
    status: projectStatuses.NEW,
    owner: userEntrepreneur.id
  };

  const executingProject = {
    id: 2,
    status: projectStatuses.EXECUTING,
    owner: userEntrepreneur.id,
    address: ALL_ZERO_ADDRESS
  };

  const openReviewProject = {
    id: 3,
    status: projectStatuses.OPEN_REVIEW
  };

  // MILESTONES
  const updatableMilestone = {
    id: 1,
    project: draftProject.id,
    description: 'UpdatableDescription',
    title: 'UpdatableTitle'
  };

  const nonUpdatableMilestone = {
    id: 2,
    project: executingProject.id,
    description: 'NonUpdatableDescription',
    category: 'NonUpdatableCategory'
  };

  const claimableMilestone = {
    id: 3,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.CLAIMABLE
  };

  const pendingClaimMilestone = {
    id: 4,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.PENDING
  };

  const claimedMilestone = {
    id: 5,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.CLAIMED
  };

  const updatableOpenReviewMilestone = {
    id: 6,
    project: openReviewProject.id
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

  const updatableTaskEvidence1 = {
    id: 1,
    description: 'desc',
    proof: 'proof',
    approved: true,
    txHash: 'tx',
    status: 'st',
    task: updatableTask.id
  };
  const updatableTaskEvidence2 = {
    id: 2,
    description: 'desc',
    proof: 'proof',
    approved: true,
    txHash: 'tx2',
    status: 'st',
    task: updatableTask.id
  };

  const nonUpdatableTask = {
    id: 2,
    milestone: nonUpdatableMilestone.id
  };

  const taskWithOracle = {
    id: 3,
    oracle: userSupporter.id,
    milestone: claimedMilestone.id
  };

  // EXCEL
  const milestonesFile = {
    data: Buffer.from('milestone data'),
    name: 'milestones.xlsx',
    size: 10
  };

  const processErrors = {
    errors: [
      { rowNumber: 1, msg: 'Missing field' },
      { rowNumber: 2, msg: 'Invalid value' }
    ]
  };

  const processedMilestones = [
    {
      title: 'Title',
      category: 'Category',
      tasks: 'Description',
      activityList: []
    },
    { activityList: [] },
    {
      title: 'Other Title',
      category: 'Other Category',
      tasks: 'Other Description',
      activityList: []
    }
  ];

  const milestoneDao = {
    findById: id => dbMilestone.find(milestone => milestone.id === id),
    saveMilestone: ({ milestone, projectId }) => {
      const newMilestoneId =
        dbMilestone.length > 0 ? dbMilestone[dbMilestone.length - 1].id + 1 : 1;
      const newMilestone = {
        project: projectId,
        id: newMilestoneId,
        ...milestone
      };
      dbMilestone.push(newMilestone);
      return newMilestone;
    },
    updateMilestone: (params, milestoneId) => {
      const found = dbMilestone.find(milestone => milestone.id === milestoneId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbMilestone[dbMilestone.indexOf(found)] = updated;
      return updated;
    },
    getMilestoneByIdWithProject: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found) return;
      return {
        ...found,
        project: dbProject.find(project => project.id === found.project)
      };
    },
    deleteMilestone: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found) return;
      dbMilestone.splice(dbMilestone.indexOf(found), 1);
      return found;
    },
    getMilestonesByProjectId: projectId => {
      const found = dbMilestone.filter(
        milestone => milestone.project === projectId
      );
      if (!found) return [];
      return found.map(milestone => {
        const tasks = dbTask.filter(task => task.milestone === milestone.id);
        return { ...milestone, tasks };
      });
    },
    getMilestones: () =>
      dbMilestone.map(milestone => ({
        ...milestone,
        project: dbProject.find(p => p.id === milestone.project),
        tasks: dbTask.filter(t => t.milestone === milestone.id)
      })),
    getMilestoneTasks: id => dbTask.filter(task => task.milestone === id)
  };

  const userProjectService = {
    getUserProjectFromRoleDescription: jest.fn()
  };

  const taskEvidenceDao = {
    getEvidencesByTaskId: taskId =>
      Promise.resolve(dbEvidence.filter(evidence => evidence.task === taskId))
  };

  const projectService = {
    getProject: id => dbProject.find(project => project.id === id),
    getProjectById: id => dbProject.find(project => project.id === id),
    getAddress: id => {
      const foundProject = dbProject.find(project => project.id === id);
      if (!foundProject)
        throw new COAError(errors.common.CantFindModelWithId('project', id));
      return foundProject.address;
    },
    updateProject: (projectId, params) => {
      const found = dbProject.find(task => task.id === projectId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbProject[dbProject.indexOf(found)] = updated;
      return updated;
    }
  };

  const projectDao = {
    findById: id => dbProject.find(p => p.id === id)
  };

  const changelogService = {
    createChangelog: jest.fn()
  };

  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    }
  };

  const activityService = {
    isTaskVerified: jest.fn(taskId => !!taskId),
    createActivities: () => {}
  };

  beforeAll(() => {
    files.saveFile = jest.fn();
    files.validateAndSaveFile = jest.fn((type, fileToSave) => {
      validateMtype(type, fileToSave);
      validatePhotoSize(fileToSave);
      return '/path/to/file';
    });
  });
  // afterAll(() => restoreFiles());
  beforeEach(() => resetDb());
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Testing createMilestone', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService,
        changelogService,
        projectDao
      });
    });

    beforeEach(() => {
      dbProject.push(draftProject, newProject, executingProject);
      dbUser.push(userEntrepreneur);
    });

    it('should create the milestone and return its id', async () => {
      const createChangelogSpy = jest.spyOn(
        changelogService,
        'createChangelog'
      );
      const response = await milestoneService.createMilestone({
        projectId: draftProject.id,
        user: adminUser,
        ...newMilestoneParams
      });
      const createdMilestone = dbMilestone.find(
        milestone => milestone.id === response.milestoneId
      );
      expect(response).toHaveProperty('milestoneId');
      expect(createChangelogSpy).toHaveBeenCalledWith({
        project: draftProject.id,
        milestone: response.milestoneId,
        revision: draftProject.revision,
        action: ACTION_TYPE.ADD_MILESTONE,
        user: adminUser.id
      });
      expect(response.milestoneId).toBeDefined();
      expect(createdMilestone).toHaveProperty('id', response.milestoneId);
      expect(createdMilestone).toHaveProperty('project', draftProject.id);
      expect(createdMilestone).toHaveProperty('title', 'NewTitle');
      expect(createdMilestone).toHaveProperty('description', 'NewDescription');
    });
    it('should throw an error if an projectId is not defined', async () => {
      await expect(
        milestoneService.createMilestone({
          ...newMilestoneParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createMilestone'));
    });
    it('should throw an error if an title is not defined', async () => {
      await expect(
        milestoneService.createMilestone({
          projectId: 1,
          description: 'Description'
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createMilestone'));
    });
    it('should throw an error if an description is not defined', async () => {
      await expect(
        milestoneService.createMilestone({
          projectId: 1,
          title: 'title'
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createMilestone'));
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        milestoneService.createMilestone({
          projectId: 0,
          ...newMilestoneParams
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
    it('should throw an error if the project status is not valid to update', async () => {
      await expect(
        milestoneService.createMilestone({
          projectId: executingProject.id,
          user: adminUser,
          ...newMilestoneParams
        })
      ).rejects.toThrow(
        errors.milestone.CreateWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
  });

  describe('Testing updateMilestone', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        userProjectService,
        changelogService
      });
    });

    beforeEach(() => {
      dbProject.push(
        draftProject,
        newProject,
        executingProject,
        openReviewProject
      );
      dbMilestone.push(
        updatableMilestone,
        nonUpdatableMilestone,
        updatableOpenReviewMilestone
      );
      dbUser.push(userEntrepreneur);
    });

    const milestoneParams = {
      title: 'UpdatedTitle',
      description: 'UpdatedDescription'
    };

    it('should update the milestone and return its id', async () => {
      const response = await milestoneService.updateMilestone({
        milestoneId: updatableMilestone.id,
        ...milestoneParams,
        user: adminUser
      });
      expect(response).toEqual({ milestoneId: updatableMilestone.id });
      const updated = dbMilestone.find(
        milestone => milestone.id === response.milestoneId
      );
      expect(updated.title).toEqual(milestoneParams.title);
      expect(updated.description).toEqual(milestoneParams.description);
    });

    it('should update the milestone and return its id when its a regular user', async () => {
      jest
        .spyOn(originalUserServiceProject, 'getUserProjectFromRoleDescription')
        .mockReturnValue();
      const response = await milestoneService.updateMilestone({
        milestoneId: updatableOpenReviewMilestone.id,
        ...milestoneParams,
        user: regularUser
      });
      expect(response).toEqual({
        milestoneId: updatableOpenReviewMilestone.id
      });
    });

    it('should throw an error if milestoneId is not receivied', async () => {
      await expect(
        milestoneService.updateMilestone({
          ...milestoneParams,
          user: adminUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateMilestone'));
    });

    it('should throw an error if title is not receivied', async () => {
      await expect(
        milestoneService.updateMilestone({
          milestoneId: updatableMilestone.id,
          description: 'Description test',
          user: adminUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateMilestone'));
    });

    it('should throw an error if description is not receivied', async () => {
      await expect(
        milestoneService.updateMilestone({
          milestoneId: updatableMilestone.id,
          title: 'Title test',
          user: adminUser
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateMilestone'));
    });
    it('should throw an error if milestone does not exist', async () => {
      await expect(
        milestoneService.updateMilestone({
          milestoneId: 0,
          ...milestoneParams,
          user: adminUser
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the project status is not valid', async () => {
      await expect(
        milestoneService.updateMilestone({
          milestoneId: nonUpdatableMilestone.id,
          ...milestoneParams,
          user: adminUser
        })
      ).rejects.toThrow(
        errors.milestone.UpdateWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });

    it('should throw an error if the project status is not valid when its a regular user', async () => {
      await expect(
        milestoneService.updateMilestone({
          milestoneId: updatableMilestone.id,
          ...milestoneParams,
          user: regularUser
        })
      ).rejects.toThrow(
        errors.milestone.UpdateWithInvalidProjectStatus(projectStatuses.DRAFT)
      );
    });
  });

  describe('Testing deleteMilestone', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService,
        changelogService
      });
    });

    beforeEach(() => {
      dbProject.push(draftProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it(
      'should delete the milestone, subtract its budget from the project goal amount ' +
        'and return the milestone id',
      async () => {
        const createChangelogSpy = jest.spyOn(
          changelogService,
          'createChangelog'
        );
        const response = await milestoneService.deleteMilestone(
          updatableMilestone.id
        );
        const deleted = dbMilestone.find(
          milestone => milestone.id === response.milestoneId
        );
        const updatedProject = dbProject.find(
          project => project.id === updatableMilestone.project
        );
        expect(response).toEqual({ milestoneId: updatableMilestone.id });
        expect(deleted).toEqual(undefined);
        expect(updatedProject.goalAmount).toEqual(
          updatedProject.goalAmount - updatableTask.budget
        );
        expect(createChangelogSpy).toHaveBeenCalled();
      }
    );

    it('should throw an error if milestoneId not received', async () => {
      await expect(milestoneService.deleteMilestone()).rejects.toThrow(
        errors.common.RequiredParamsMissing('deleteMilestone')
      );
    });

    it('should throw an error if milestone does not exist', async () => {
      await expect(milestoneService.deleteMilestone(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });

    it('should throw an error if the project status is not valid', async () => {
      await expect(
        milestoneService.deleteMilestone(nonUpdatableMilestone.id)
      ).rejects.toThrow(
        errors.milestone.DeleteWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
  });

  describe('Testing deleteFieldsFromMilestone', () => {
    beforeAll(() => restoreMilestoneService());
    it(
      'should delete unneeded fields from the milestone object ' +
        'and return only description and category',
      () => {
        const fullMilestone = {
          impact: 'Impact',
          impactCriterion: 'ImpactCriterion',
          signsOfSuccess: 'SignsOfSuccess',
          signsOfSuccessCriterion: 'SignOfSuccessCriterion',
          keyPersonnel: 'KeyPersonnel',
          budget: 'Budget',
          tasks: 'Tasks',
          quarter: 'Quarter',
          category: 'Category',
          activityList: [],
          updatedAt: new Date(),
          transactionHash: '0x0',
          budgetStatus: 'BudgetStatus',
          blockchainStatus: 'BlockchainStatus'
        };
        const response = milestoneService.deleteFieldsFromMilestone(
          fullMilestone
        );
        expect(response).toEqual({
          category: 'Category',
          description: 'Tasks'
        });
      }
    );
  });

  describe('Testing deleteFieldsFromActivities', () => {
    beforeAll(() => restoreMilestoneService());
    it(
      'should add a description field to the activities ' +
        'with their tasks field value',
      () => {
        const fullActivities = [
          {
            tasks: 'Now Description',
            impactCriterion: 'New review criteria'
          },
          { tasks: 'Old tasks', impactCriterion: 'Old impact criterion' }
        ];
        const response = milestoneService.deleteFieldsFromActivities(
          fullActivities
        );
        expect(response).toEqual([
          {
            description: fullActivities[0].tasks,
            reviewCriteria: fullActivities[0].impactCriterion,
            impactCriterion: fullActivities[0].impactCriterion,
            tasks: fullActivities[0].tasks
          },
          {
            description: fullActivities[1].tasks,
            reviewCriteria: fullActivities[1].impactCriterion,
            impactCriterion: fullActivities[1].impactCriterion,
            tasks: fullActivities[1].tasks
          }
        ]);
      }
    );
  });

  describe('Testing createMilestones', () => {
    beforeAll(() => {
      restoreMilestoneService();
      milestoneService.processMilestones = jest.fn();
      injectMocks(milestoneService, {
        activityService,
        milestoneDao
      });
    });

    it('should return a list of processed milestones and save them to db', async () => {
      milestoneService.processMilestones.mockReturnValueOnce({
        milestones: processedMilestones,
        errors: []
      });

      const response = await milestoneService.createMilestones(
        milestonesFile,
        1
      );
      const foundMilestones = dbMilestone.filter(
        milestone => milestone.project === 1
      );
      expect(response).toHaveLength(3);
      expect(response.filter(r => !!r)).toEqual(foundMilestones);
    });

    it('should throw an error if the file does not have data', async () => {
      await expect(
        milestoneService.createMilestones({ name: 'file.xlsx' }, 1)
      ).rejects.toThrow(errors.milestone.CantProcessMilestonesFile);
    });

    it('should a list of errors if the processed file has errors', async () => {
      milestoneService.processMilestones.mockReturnValueOnce(processErrors);
      const response = await milestoneService.createMilestones(
        milestonesFile,
        1
      );
      expect(response).toEqual(processErrors);
    });

    it('should throw an error if the milestones processing failed', async () => {
      milestoneService.processMilestones.mockImplementationOnce(() =>
        Promise.reject()
      );
      await expect(
        milestoneService.createMilestones(milestonesFile, 2)
      ).rejects.toThrow(errors.milestone.ErrorCreatingMilestonesFromFile);
    });
  });

  describe('Testing isMilestoneEmpty', () => {
    beforeAll(() => restoreMilestoneService());
    it(
      'should return false if milestone has at least 1 field with data ' +
        'besides activityList',
      () => {
        const mockMilestone = {
          category: 'Category',
          activityList: []
        };

        expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(false);
      }
    );

    it(
      'should return true if milestone does not have any fields with data ' +
        'except activityList',
      () => {
        const mockMilestone = {
          activityList: []
        };
        expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(true);
      }
    );
  });

  describe('Testing isMilestoneValid', () => {
    beforeAll(() => restoreMilestoneService());
    it('should return true if milestone has quarter, tasks and impact not empty', () => {
      const mockMilestone = {
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        impact: 'Impact M1',
        activityList: []
      };

      expect(milestoneService.isMilestoneValid(mockMilestone)).toBe(true);
    });

    it('should return false if milestone has quarter, tasks or impact empty', () => {
      const mockMilestoneWithoutQuarter = {
        quarter: '',
        tasks: 'Task M1',
        impact: 'Impact M1',
        activityList: []
      };

      const mockMilestoneWithoutTasks = {
        quarter: 'Quarter 1',
        tasks: '',
        impact: 'Impact M1',
        activityList: []
      };

      const mockMilestoneWithoutImpact = {
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        activityList: []
      };

      expect(
        milestoneService.isMilestoneValid(mockMilestoneWithoutQuarter)
      ).toBe(false);
      expect(milestoneService.isMilestoneValid(mockMilestoneWithoutTasks)).toBe(
        false
      );
      expect(
        milestoneService.isMilestoneValid(mockMilestoneWithoutImpact)
      ).toBe(false);
    });
  });

  describe('Testing verifyMilestone', () => {
    beforeAll(() => restoreMilestoneService());
    it('should return true if the milestone has tasks and category not empty', () => {
      const milestone = { tasks: 'Tasks', category: 'Category' };
      expect(milestoneService.verifyMilestone(milestone, () => {})).toBe(true);
    });

    it('should return false if activity has at least one field empty', () => {
      const milestone = { tasks: '' };
      expect(milestoneService.verifyMilestone(milestone, () => {})).toBe(false);
    });
  });

  describe('Testing verifyActivity', () => {
    beforeAll(() => restoreMilestoneService());
    it('should return true if the activity has all fields not empty', () => {
      const activity = {
        tasks: 'tasks',
        impact: 'impact',
        impactCriterion: 'impactCriterion',
        signsOfSuccess: 'signsOfSuccess',
        signsOfSuccessCriterion: 'signsOfSuccessCriterion',
        category: 'category',
        keyPersonnel: 'keyPersonnel',
        budget: 'budget'
      };
      expect(milestoneService.verifyActivity(activity, () => {})).toBe(true);
    });

    it('should return false if activity has at least one field empty', () => {
      const activity = {
        impact: 'impact',
        impactCriterion: '',
        signsOfSuccess: '',
        keyPersonnel: 'keyPersonnel',
        budget: 'budget'
      };
      expect(milestoneService.verifyActivity(activity, () => {})).toBe(false);
    });
  });

  describe('Testing getAllMilestonesByProject', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        activityService
      });
    });

    beforeEach(() => {
      dbMilestone.push(
        { ...updatableMilestone, project: executingProject.id },
        nonUpdatableMilestone
      );
      dbTask.push(nonUpdatableTask, updatableTask);
    });

    it("should return a list of the project's milestones with their activities", async () => {
      const response = await milestoneService.getAllMilestonesByProject(
        executingProject.id
      );
      expect(response).toHaveLength(2);
      expect(response).toEqual([
        {
          ...updatableMilestone,
          project: executingProject.id,
          tasks: [{ ...updatableTask }]
        },
        {
          ...nonUpdatableMilestone,
          tasks: [{ ...nonUpdatableTask }]
        }
      ]);
    });

    it('should return undefined if no milestones were retrieved from database', async () => {
      const response = await milestoneService.getAllMilestonesByProject(0);
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getMilestoneById', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbMilestone.push(updatableMilestone);
    });

    it('should return the existing milestone if found', async () => {
      const response = await milestoneService.getMilestoneById(
        updatableMilestone.id
      );
      expect(response).toEqual(updatableMilestone);
    });

    it('should throw an error if milestone was not found', async () => {
      await expect(milestoneService.getMilestoneById(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });
  });

  describe('Testing getMilestones', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        taskEvidenceDao
      });
    });

    beforeEach(() => {
      dbProject.push(draftProject, newProject, executingProject);
      dbMilestone.push(
        { ...updatableMilestone, project: newProject.id },
        nonUpdatableMilestone
      );
      dbTask.push(updatableTask, nonUpdatableTask);
      dbEvidence.push(updatableTaskEvidence1, updatableTaskEvidence2);
    });
    it('should return a list with all existing milestones', async () => {
      const response = await milestoneService.getMilestones();
      expect(response).toHaveLength(2);
      expect(response).toEqual([
        {
          ...updatableMilestone,
          project: newProject,
          tasks: [
            {
              ...updatableTask,
              evidences: [updatableTaskEvidence1, updatableTaskEvidence2]
            }
          ]
        },
        {
          ...nonUpdatableMilestone,
          project: executingProject,
          tasks: [{ ...nonUpdatableTask, evidences: [] }]
        }
      ]);
    });
    it('should return an empty array if not milestones were found', async () => {
      resetDb();
      const response = await milestoneService.getMilestones();
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing claimMilestone', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbMilestone = [];
      dbProject.push(executingProject);
      dbUser.push(userEntrepreneur);
      dbMilestone.push(claimableMilestone);
    });

    it('should claim the milestone and return its id', async () => {
      const response = await milestoneService.claimMilestone({
        userId: userEntrepreneur.id,
        milestoneId: claimableMilestone.id
      });

      expect(response).toEqual({ milestoneId: claimableMilestone.id });
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('claimMilestone'));
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: 0
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the owner', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: 2,
          milestoneId: claimableMilestone.id
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(newProject);
      dbMilestone.push({ ...updatableMilestone, project: newProject.id });

      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: updatableMilestone.id
        })
      ).rejects.toThrow(
        errors.project.InvalidStatusForClaimMilestone(projectStatuses.NEW)
      );
    });

    it('should throw an error if the milestone is not in claimable status', async () => {
      dbMilestone.push(pendingClaimMilestone);

      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: pendingClaimMilestone.id
        })
      ).rejects.toThrow(
        errors.milestone.InvalidStatusForClaimMilestone(
          claimMilestoneStatus.PENDING
        )
      );
    });
  });

  describe('Testing transferredMilestone', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService,
        userService,
        setNextAsClaimable: jest.fn(),
        isMilestoneCompleted: jest.fn()
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbMilestone = [];
      dbProject.push(executingProject);
      dbUser.push(userBankoperator);
      dbMilestone.push(claimedMilestone);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should claim the milestone and return its id', async () => {
      const response = await milestoneService.transferredMilestone({
        userId: userBankoperator.id,
        milestoneId: claimedMilestone.id,
        claimReceiptFile: imgFile
      });
      expect(response).toEqual({ milestoneId: claimedMilestone.id });
    });

    // it('should call setNextAsClaimable if the milestone is completed', async () => {
    //   milestoneService.isMilestoneCompleted.mockReturnValueOnce(true);
    //   await expect(
    //     milestoneService.transferredMilestone({
    //       userId: userBankoperator.id,
    //       milestoneId: claimedMilestone.id
    //     })
    //   ).resolves.toBeDefined();
    //   expect(milestoneService.setNextAsClaimable).toBeCalled();
    // });

    // it('should not call setNextAsClaimable if the milestone is not completed', async () => {
    //   milestoneService.isMilestoneCompleted.mockReturnValueOnce(false);
    //   await expect(
    //     milestoneService.transferredMilestone({
    //       userId: userBankoperator.id,
    //       milestoneId: claimedMilestone.id
    //     })
    //   ).resolves.toBeDefined();
    //   expect(milestoneService.setNextAsClaimable).not.toBeCalled();
    // });

    it('should throw an error if user is not a bank operator', async () => {
      dbUser.push(userEntrepreneur);

      await expect(
        milestoneService.transferredMilestone({
          userId: userEntrepreneur.id,
          milestoneId: claimedMilestone.id,
          claimReceiptFile: imgFile
        })
      ).rejects.toThrow(errors.common.UserNotAuthorized(userEntrepreneur.id));
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('transferredMilestone')
      );
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: 0,
          claimReceiptFile: imgFile
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(newProject);
      dbMilestone.push({ ...updatableMilestone, project: newProject.id });

      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: updatableMilestone.id,
          claimReceiptFile: imgFile
        })
      ).rejects.toThrow(
        errors.common.InvalidStatus('project', projectStatuses.NEW)
      );
    });

    it('should throw an error if the milestone is not in claimed status', async () => {
      dbMilestone.push(pendingClaimMilestone);

      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: pendingClaimMilestone.id,
          claimReceiptFile: imgFile
        })
      ).rejects.toThrow(
        errors.common.InvalidStatus('milestone', claimMilestoneStatus.PENDING)
      );
    });
  });

  describe('Testing setClaimable', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      resetDb();
      dbProject.push(executingProject);
      dbUser.push(userEntrepreneur);
      dbMilestone.push(pendingClaimMilestone);
    });

    it('should mark the milestone as claimable and return its id', async () => {
      const response = await milestoneService.setClaimable(
        pendingClaimMilestone.id
      );

      expect(response).toEqual(pendingClaimMilestone.id);

      const updated = dbMilestone.find(
        milestone => milestone.id === pendingClaimMilestone.id
      );
      expect(updated.claimStatus).toEqual(claimMilestoneStatus.CLAIMABLE);
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(milestoneService.setClaimable()).rejects.toThrow(
        errors.common.RequiredParamsMissing('setClaimable')
      );
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(milestoneService.setClaimable(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(newProject);
      dbMilestone = [{ ...pendingClaimMilestone, project: newProject.id }];

      await expect(
        milestoneService.setClaimable(pendingClaimMilestone.id)
      ).rejects.toThrow(
        errors.project.InvalidStatusForClaimableMilestone(newProject.status)
      );
    });

    it('should throw an error if the milestone is not in pending status', async () => {
      dbMilestone.push(claimableMilestone);

      await expect(
        milestoneService.setClaimable(claimableMilestone.id)
      ).rejects.toThrow(
        errors.milestone.InvalidStatusForClaimableMilestone(
          claimableMilestone.claimStatus
        )
      );
    });
  });

  describe('Testing isMilestoneCompleted', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao,
        projectService,
        userService
      });
    });

    beforeEach(async () => {
      resetDb();
      dbUser.push(userSupporter);
      dbMilestone.push(
        { ...updatableMilestone, project: newProject.id },
        claimedMilestone
      );
      dbProject.push(executingProject, newProject);
      dbTask.push(taskWithOracle);
      await deployContracts();
    });
    // it('should return true if all tasks are approved', async () => {
    //   const signerAddress = await run('get-signer-zero');
    //   const projectAddress = await run('create-project');
    //   dbUser = [{ ...userSupporter, address: signerAddress }];
    //   dbProject = [{ ...executingProject, address: projectAddress }];
    //   const claimHash = sha3(
    //     executingProject.id,
    //     taskWithOracle.oracle,
    //     taskWithOracle.id
    //   );
    //   await run('add-claim', {
    //     project: projectAddress,
    //     claim: claimHash,
    //     valid: true,
    //     milestone: claimedMilestone.id
    //   });
    //   await expect(
    //     milestoneService.isMilestoneCompleted(claimedMilestone.id)
    //   ).resolves.toBe(true);
    // });

    // it('should return false if any task is not approved', async () => {
    //   const signerAddress = await run('get-signer-zero');
    //   const projectAddress = await run('create-project');
    //   dbUser = [{ ...userSupporter, address: signerAddress }];
    //   dbProject = [{ ...executingProject, address: projectAddress }];
    //   dbTask.push(invalidTaskWithOracle);
    //   const validClaimHash = sha3(
    //     executingProject.id,
    //     taskWithOracle.oracle,
    //     taskWithOracle.id
    //   );
    //   const invalidClaimHash = sha3(
    //     executingProject.id,
    //     signerAddress,
    //     invalidTaskWithOracle.id
    //   );
    //   await run('add-claim', {
    //     project: projectAddress,
    //     claim: validClaimHash,
    //     valid: true,
    //     milestone: claimedMilestone.id
    //   });
    //   await run('add-claim', {
    //     project: projectAddress,
    //     claim: invalidClaimHash,
    //     valid: false,
    //     milestone: claimedMilestone.id
    //   });
    //   await expect(
    //     milestoneService.isMilestoneCompleted(claimedMilestone.id)
    //   ).resolves.toBe(false);
    // });
    it('should throw an error if any required param is missing', async () => {
      await expect(milestoneService.isMilestoneCompleted()).rejects.toThrow(
        errors.common.RequiredParamsMissing('isMilestoneCompleted')
      );
    });
    it('should throw an error if the milestone does not exist', async () => {
      await expect(milestoneService.isMilestoneCompleted(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });
    it('should throw an error if the milestone project does not have an address', async () => {
      await expect(
        milestoneService.isMilestoneCompleted(updatableMilestone.id)
      ).rejects.toThrow(errors.project.AddressNotFound(newProject.id));
    });
    it('should throw an error if any task does not have an oracle', async () => {
      dbUser = [{ ...userSupporter, address: undefined }];
      await expect(
        milestoneService.isMilestoneCompleted(claimedMilestone.id)
      ).rejects.toThrow(errors.task.OracleAddressNotFound(taskWithOracle.id));
    });
  });

  describe('Testing getNextMilestoneId', () => {
    beforeAll(() => {
      restoreMilestoneService();
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      resetDb();
      dbProject.push(executingProject);
      dbMilestone.push(claimableMilestone, pendingClaimMilestone);
    });

    it(
      'should return the id of the next milestone of ' +
        'the same project if it is not the last one',
      async () => {
        const response = await milestoneService.getNextMilestoneId(
          claimableMilestone.id
        );
        expect(response).toEqual(pendingClaimMilestone.id);
      }
    );

    it(
      'should return undefined if the milestone is ' +
        'the last one in the project',
      async () => {
        const response = await milestoneService.getNextMilestoneId(
          pendingClaimMilestone.id
        );
        expect(response).toBeUndefined();
      }
    );

    it('should throw an error if any required param is missing', async () => {
      await expect(milestoneService.getNextMilestoneId()).rejects.toThrow(
        errors.common.RequiredParamsMissing('getNextMilestoneId')
      );
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(milestoneService.getNextMilestoneId(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });
  });

  describe('Testing setNextAsClaimable', () => {
    beforeAll(() => {
      restoreMilestoneService();
    });

    beforeEach(() => {
      milestoneService.getNextMilestoneId = jest.fn();
      milestoneService.setClaimable = jest.fn();
    });

    it(
      'should call getNextMilestoneId with the current milestone param ' +
        'and setClaimable with the next milestone and return its response',
      async () => {
        const currentMilestoneId = 1;
        const nextMilestoneId = 2;
        milestoneService.getNextMilestoneId.mockReturnValueOnce(
          nextMilestoneId
        );
        milestoneService.setClaimable.mockReturnValueOnce(nextMilestoneId);
        const response = await milestoneService.setNextAsClaimable(
          currentMilestoneId
        );
        expect(milestoneService.getNextMilestoneId).toHaveBeenCalledWith(
          currentMilestoneId
        );
        expect(milestoneService.setClaimable).toHaveBeenCalledWith(
          nextMilestoneId
        );
        expect(response).toEqual(nextMilestoneId);
      }
    );

    // it(
    //   'should return undefined and not call setClaimable ' +
    //     'if the current milestone is the last one',
    //   async () => {
    //     const currentAndLastMilestoneId = 1;
    //     milestoneService.getNextMilestoneId.mockReturnValueOnce(undefined);
    //     const response = await milestoneService.setNextAsClaimable(
    //       currentAndLastMilestoneId
    //     );
    //     expect(milestoneService.getNextMilestoneId).toHaveBeenCalledWith(
    //       currentAndLastMilestoneId
    //     );
    //     expect(milestoneService.setClaimable).not.toHaveBeenCalled();
    //     expect(response).toBeUndefined();
    //   }
    // );
  });
});
