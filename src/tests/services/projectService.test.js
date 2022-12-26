require('jest-fetch-mock').enableMocks();
const { coa } = require('@nomiclabs/buidler');
const COAError = require('../../rest/errors/COAError');
const { sha3 } = require('../../rest/util/hash');
const {
  userRoles,
  projectStatuses,
  txFunderStatus,
  supporterRoles,
  claimMilestoneStatus,
  rolesTypes,
  ACTION_TYPE
} = require('../../rest/util/constants');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const validateMtype = require('../../rest/services/helpers/validateMtype');
const validatePhotoSize = require('../../rest/services/helpers/validatePhotoSize');
const txExplorerHelper = require('../../rest/services/helpers/txExplorerHelper');
const validators = require('../../rest/services/helpers/projectStatusValidators/validators');

const { injectMocks } = require('../../rest/util/injection');

const storage = require('../../rest/util/storage');
const files = require('../../rest/util/files');
const originalProjectService = require('../../rest/services/projectService');

let projectService = Object.assign({}, originalProjectService);
const restoreProjectService = () => {
  projectService = Object.assign({}, originalProjectService);
};

const projectName = 'validProjectName';
const location = 'Argentina';
const timeframe = '12';
const timeframeUnit = '30';
const goalAmount = 124123;
const mission = 'mission';
const problemAddressed = 'the problem';
const currencyType = 'Crypto';
const currency = 'ETH';
const additionalCurrencyInformation =
  '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
const coverPhotoPath = 'detail.jpeg';
const proposal = 'proposal';
const ownerId = 2;
const file = { name: 'project.jpeg', size: 1234 };
const milestoneFile = { name: 'project.xlsx', size: 1234 };
const task1 = {
  id: 1,
  oracle: '0x11111111',
  description: 'Task 1 Description',
  reviewCriteria: 'Task 1 Review',
  category: 'Task 1 Category',
  keyPersonnel: 'Task 1 KeyPersonnel',
  budget: 3500
};
const task2 = {
  id: 2,
  oracle: '0x22222222',
  description: 'Task 2 Description',
  reviewCriteria: 'Task 2 Review',
  category: 'Task 2 Category',
  keyPersonnel: 'Task 2 KeyPersonnel',
  budget: 1000
};
const task3 = {
  id: 3,
  oracle: '0x33333333',
  description: 'Task 3 Description',
  reviewCriteria: 'Task 3 Review',
  category: 'Task 3 Category',
  keyPersonnel: 'Task 3 KeyPersonnel',
  budget: 500
};

const milestone = {
  id: 2,
  projectId: 21,
  description: 'Milestone description',
  tasks: [task1, task2, task3]
};

const milestoneOfExecutingProject = {
  id: 3,
  projectId: 15,
  description: 'Milestone description',
  tasks: [task1, task2, task3]
};

const evidenceOfTask1 = {
  id: 1,
  task: task1.id,
  description: 'evidenceOfTask1'
};

const evidenceOfTask2 = {
  id: 2,
  task: task2.id,
  description: 'evidenceOfTask2'
};

const evidence2OfTask2 = {
  id: 3,
  task: task2.id,
  description: 'evidence2OfTask2'
};

// evidence files
const fileOfevidenceOfTask1 = {
  fileId: 1,
  evidence: evidenceOfTask1.id,
  id: 1
};

const pdfFile = { name: 'file.pdf', size: 1234 };
const docFile = { name: 'file.doc', size: 1234 };

const entrepreneurUser = {
  id: 2,
  firstName: 'Social',
  lastName: 'Entrepreneur',
  role: userRoles.ENTREPRENEUR,
  email: 'seuser@email.com',
  address: '0x02222222'
};

const adminUser = {
  id: 2,
  firstName: 'Admin',
  lastName: 'user',
  role: userRoles.COA_ADMIN,
  email: 'admin@email.com',
  address: '0x02222222'
};

const curatorUser = {
  id: 4,
  role: userRoles.PROJECT_CURATOR
};

const pendingProject = {
  id: 3,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.TO_REVIEW,
  milestones: [milestone],
  milestonePath: 'milestonePath'
};

const draftProjectWithMilestone = {
  id: 10,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.NEW,
  milestones: [milestone],
  milestonePath: 'milestonePath'
};

const draftProject = {
  id: 1,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.NEW,
  parent: null
};

const draftProjectFirstUpdate = {
  id: 20,
  projectName,
  goalAmount: 0,
  dataComplete: 0,
  owner: 4,
  status: projectStatuses.DRAFT
};

const draftProjectSecondUpdate = {
  id: 21,
  projectName,
  location,
  timeframe,
  timeframeUnit,
  goalAmount,
  dataComplete: 15,
  owner: 4,
  cardPhotoPath: 'cardPhotoPath',
  agreementFilePath: 'agreementFileHash',
  proposalFilePath: 'proposalFilePath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.DRAFT
};

const executingProject = {
  id: 15,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'path/to/cardPhoto.jpg',
  coverPhotoPath: 'path/to/coverPhoto.jpg',
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.EXECUTING,
  milestones: [milestone],
  milestonePath: 'path/to/milestone.xls',
  txHash: '0x151515',
  address: '0x151515'
};

const nonGenesisProject = {
  id: 16,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'path/to/cardPhoto.jpg',
  coverPhotoPath: 'path/to/coverPhoto.jpg',
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.EXECUTING,
  milestones: [milestone],
  milestonePath: 'path/to/milestone.xls',
  txHash: '0x151515',
  address: '0x151515',
  parentId: 1,
  revision: 1
};

const openReviewProject = {
  id: 17,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'path/to/cardPhoto.jpg',
  coverPhotoPath: 'path/to/coverPhoto.jpg',
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.OPEN_REVIEW,
  milestones: [milestone],
  milestonePath: 'path/to/milestone.xls',
  txHash: '0x151515',
  address: '0x151515',
  revision: 1
};

const supporterUser = {
  id: 5,
  firstName: 'Supporter',
  lastName: 'User',
  role: userRoles.PROJECT_SUPPORTER,
  email: 'suppuser@email.com',
  address: '0x05555555'
};

const verifiedTransfers = [
  {
    id: 1,
    sender: supporterUser,
    status: txFunderStatus.VERIFIED
  }
];

const consensusProject = {
  id: 4,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.CONSENSUS
};

const projectWithTransfer = {
  id: 6,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.FUNDING
};

const toReviewProject = {
  id: 8,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.TO_REVIEW
};

const beneficiaryRole = {
  id: 1,
  description: rolesTypes.BENEFICIARY
};

const userService = {
  getUserById: id => {
    if (id === 2 || id === 3) {
      return {
        id,
        role: userRoles.ENTREPRENEUR
      };
    }
    if (id === 4) {
      return {
        id,
        role: userRoles.COA_ADMIN
      };
    }
    throw new COAError(errors.common.CantFindModelWithId('user', id));
  }
};

const projectDao = {
  saveProject: project => {
    if (
      project.projectName === 'validProjectName' ||
      project.projectName === 'Untitled'
    ) {
      return {
        id: 1,
        revision: 1
      };
    }
    return undefined;
  },
  updateProject: (fields, projectId) => {
    if (
      projectId === 1 ||
      projectId === 3 ||
      projectId === 4 ||
      projectId === 8 ||
      projectId === 10 ||
      projectId === 20 ||
      projectId === 21
    ) {
      return {
        projectName: 'projectUpdateado',
        ...fields,
        id: projectId
      };
    }
    return undefined;
  },
  findById: id => {
    if (id === 1) return draftProject;
    if (id === 3) return pendingProject;
    if (id === 4) return consensusProject;
    if (id === 10) return draftProjectWithMilestone;
    if (id === 15) return executingProject;
    if (id === 8) return toReviewProject;
    if (id === 20) return draftProjectFirstUpdate;
    if (id === 21) return draftProjectSecondUpdate;
    return undefined;
  },
  findOneByProps: (filters, populate) => {
    if (filters && filters.id === 15) {
      if (populate && populate.owner) {
        return {
          ...executingProject,
          owner: entrepreneurUser,
          milestones: undefined
        };
      }
      return { ...executingProject, milestones: undefined };
    }
    if (filters && filters.id === 4) {
      if (populate && populate.owner) {
        return {
          ...consensusProject,
          owner: entrepreneurUser
        };
      }
      return { ...consensusProject };
    }
    return undefined;
  },
  findProjectWithUsersById: projectId => {
    if (projectId === 4) {
      return {
        ...consensusProject,
        owner: entrepreneurUser,
        followers: [supporterUser],
        funders: [supporterUser],
        oracles: [supporterUser, supporterUser]
      };
    }
    return undefined;
  },
  findProjectsWithTransfers: () => [projectWithTransfer]
};

const milestoneDao = {
  findById: id => {
    if (id === 2) {
      return milestone;
    }
    return undefined;
  }
};

const milestoneService = {
  createMilestones: (milestonePath, projectId) => {
    if (projectId === 1) {
      return [milestone];
    }
    if (projectId === 10) {
      return [milestone];
    }
  },
  getAllMilestonesByProject: projectId => {
    if (projectId === 3 || projectId === 15) {
      return [milestone];
    }
    return undefined;
  },

  removeMilestonesFromProject: projectId => {
    if (projectId === 10) {
      return [milestone];
    }
  }
};

const transferService = {
  getAllTransfersByProps: props => {
    const { filters } = props || {};
    if (filters && filters.project === 15) {
      return verifiedTransfers;
    }
  }
};

const mailService = {
  sendProjectStatusChangeMail: jest.fn()
};

const changelogService = {
  createChangelog: jest.fn(() => Promise.resolve())
};

describe('Project Service Test', () => {
  let dbRole = [];
  let dbUserProject = [];
  let dbProject = [];
  let dbProjectFunder = [];
  let dbProjectOracle = [];
  let dbUser = [];
  let dbMilestone = [];
  let dbTask = [];
  let dbEvidence = [];
  let dbFileEvidence = [];

  const resetDb = () => {
    dbRole = [];
    dbUserProject = [];
    dbProject = [];
    dbUser = [];
    dbProjectOracle = [];
    dbProjectFunder = [];
    dbMilestone = [];
    dbTask = [];
    dbEvidence = [];
    dbFileEvidence = [];
  };

  const roleService = {
    getRoleByDescription: description =>
      Promise.resolve(dbRole.find(role => role.description === description))
  };

  const userProjectService = {
    getBeneficiaryByProjectId: ({ projectId }) => {
      const role = dbRole.find(r => r.description === rolesTypes.BENEFICIARY);
      const userProject = dbUserProject.find(
        up => up.project === projectId && up.role === role.id
      );
      if (!userProject) return undefined;
      const user = dbUser.find(u => u.id === userProject.user);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      };
    },
    validateUserWithRoleInProject: jest.fn(),
    getUserProjectFromRoleDescription: jest.fn()
  };

  beforeEach(() => resetDb());

  beforeAll(() => {
    files.saveFile = jest.fn();
    files.validateAndSaveFile = jest.fn((type, fileToSave) => {
      validateMtype(type, fileToSave);
      validatePhotoSize(fileToSave);
      return '/path/to/file';
    });
    storage.generateStorageHash = jest.fn((fileToSave, type) => {
      if (type) {
        validateMtype(type, fileToSave);
        validatePhotoSize(fileToSave);
      }
      return 'fileHash';
    });
    // mock all validators
    Object.keys(validators).forEach(validator => {
      validators[validator] = jest.fn();
    });
    coa.getTransactionResponse = jest.fn(() => null);
    coa.getBlock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Update project', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao });
    });

    it('Whenever there is no update, an error should be thrown', async () => {
      expect(
        projectService.updateProject(0, {
          field: 'field1',
          field2: 'field2'
        })
      ).rejects.toThrow(errors.project.CantUpdateProject(0));
    });
    it('When an update is done, it should return the id of the updated project', async () => {
      const projectUpdated = await projectService.updateProject(1, {
        field: 'field1',
        field2: 'field2'
      });
      expect(
        projectService.updateProject(1, {
          field: 'field1',
          field2: 'field2'
        })
      ).resolves.not.toThrow(COAError);
      expect(projectUpdated).toEqual(1);
    });
  });

  describe('Save project', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao });
    });

    it('Whenever a project is saved, it should return the id of the project', async () => {
      const id = await projectService.saveProject({
        projectName: 'validProjectName'
      });
      expect(id).toEqual({ id: 1, revision: 1 });
    });

    it('Whenever an error occurs and the project cant be saved, an error should be thrown', () => {
      expect(
        projectService.saveProject({ projectName: 'invalidProject' })
      ).rejects.toThrow(errors.project.CantSaveProject);
    });
  });

  describe('Project thumbnail', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao, userService });
    });

    describe('Create project thumbnail', () => {
      it('Should create a new project when all the fields are valid', async () => {
        const { projectId } = await projectService.createProjectThumbnail({
          projectName,
          location,
          timeframe,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not create a project when some field is missing and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            ownerId
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('createProjectThumbnail')
        );
      });

      it('Should not create a project when the fileType is not valid and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            ownerId,
            file: { name: 'invalidFile.json' }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not create a project when the owner does not exist and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            ownerId: 34,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });

      it('Should not create a project when the file is too big and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            ownerId,
            file: { name: 'project.jpeg', size: 123455555 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });

    describe('Update project thumbnail', () => {
      it('Should update the project whenever the fields are valid and the project already exists', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          location,
          timeframe,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not update the project whenever the fields are valid but the project is in executing status', async () => {
        await expect(
          projectService.updateProjectThumbnail(15, {
            projectName,
            location,
            timeframe,
            ownerId,
            file
          })
        ).rejects.toThrow(
          errors.project.ProjectCantBeUpdated(projectStatuses.EXECUTING)
        );
      });

      it('Should not update the project whenever the fields are valid but the project does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(2, {
            projectName,
            location,
            timeframe,
            ownerId,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not update the project whenever the fields are valid and the project exists but user is not owner of the project, and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            ownerId: 3,
            file
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });

      it('Should not update the project whenever the photo has an invalid file type and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            ownerId,
            file: { name: 'file.json', size: 1234 }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not update the project whenever the photo has an invalid size and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            ownerId,
            file: { name: 'file.jpeg', size: 90000000 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should update the project although file field is missing', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          location,
          timeframe,
          ownerId
        });
        expect(projectId).toEqual(1);
      });
    });

    describe('Get project thumbnail', () => {
      it('Should return the project thumbnail when the project exists', async () => {
        const response = await projectService.getProjectThumbnail(1);
        expect(response.projectName).toEqual('validProjectName');
        expect(response.location).toEqual('Argentina');
        expect(response.timeframe).toEqual('12');
        expect(response.goalAmount).toEqual(124123);
        expect(response.imgPath).toEqual('cardPhotoPath');
      });
      it('Should throw an error when the project does not exist', async () => {
        await expect(projectService.getProjectThumbnail(0)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 0)
        );
      });
    });
  });

  describe('Basic information', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao,
        userService,
        changelogService
      });
    });

    describe('Create project', () => {
      const adminUserId = 4;
      it('Should create a new project when all the fields are valid', async () => {
        const createChangelogSpy = jest.spyOn(
          changelogService,
          'createChangelog'
        );
        const { projectId } = await projectService.createProject({
          ownerId: adminUserId
        });
        expect(projectId).toEqual(1);
        expect(createChangelogSpy).toHaveBeenCalledWith({
          project: projectId,
          action: ACTION_TYPE.CREATE_PROJECT,
          revision: 1,
          user: 4
        });
      });

      it('Should not create a project when the owner does not exist and throw an error', async () => {
        await expect(
          projectService.createProject({
            projectName,
            location,
            timeframe,
            timeframeUnit,
            ownerId: 34,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });
    });

    describe('Update basic project information', () => {
      it('Should update the project whenever the fields are valid and the project already exists', async () => {
        const createChangelogSpy = jest.spyOn(
          changelogService,
          'createChangelog'
        );
        const {
          projectId
        } = await projectService.updateBasicProjectInformation({
          projectId: 20,
          projectName,
          location,
          timeframe,
          timeframeUnit,
          file
        });
        expect(projectId).toEqual(20);
        expect(createChangelogSpy).toHaveBeenCalled();
      });

      it('Should not update the project when timeframe is equal to 0 and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe: 0,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(errors.project.InvalidTimeframe());
      });

      it('Should not update the project when timeframe is less than 0 and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe: -10,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(errors.project.InvalidTimeframe());
      });

      it('Should not update the project whenever the fields are valid but the project is in executing status', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 15,
            projectName,
            location,
            timeframe,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(
          errors.project.ProjectCantBeUpdated(projectStatuses.EXECUTING)
        );
      });

      it('Should not update the project whenever the fields are valid but the project does not exist and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 2,
            projectName,
            location,
            timeframe,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not update the project whenever the photo has an invalid file type and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe,
            timeframeUnit,
            file: { name: 'file.json', size: 1234 }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not update the project whenever the photo has an invalid size and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe,
            timeframeUnit,
            file: { name: 'file.jpeg', size: 90000000 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should update the project although file field is missing after the first update', async () => {
        const {
          projectId
        } = await projectService.updateBasicProjectInformation({
          projectId: 21,
          projectName,
          location,
          timeframe,
          timeframeUnit
        });
        expect(projectId).toEqual(21);
      });

      it('Should not update a project when projectName field is missing and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            location,
            timeframe,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateBasicProjectInformation')
        );
      });

      it('Should not update a project when timeframe field is missing and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframeUnit,
            file
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateBasicProjectInformation')
        );
      });

      it('Should not update a project when timeframeUnit field is missing and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe,
            file
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateBasicProjectInformation')
        );
      });

      it('Should not update a project when file field is missing in the first update and throw an error', async () => {
        await expect(
          projectService.updateBasicProjectInformation({
            projectId: 20,
            projectName,
            location,
            timeframe,
            timeframeUnit
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateBasicProjectInformation')
        );
      });
    });
  });

  describe('Project details', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao,
        userService,
        changelogService
      });
    });

    describe('Update project details', () => {
      it('Should update the project if it exists and all fields are valid', async () => {
        const { projectId } = await projectService.updateProjectDetails({
          projectId: 20,
          mission,
          problemAddressed,
          currencyType,
          currency,
          additionalCurrencyInformation,
          legalAgreementFile: pdfFile,
          projectProposalFile: pdfFile
        });
        expect(projectId).toEqual(20);
      });

      it('Should not update the project whenever the fields are valid but the project is in executing status', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 15,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.project.ProjectCantBeUpdated(projectStatuses.EXECUTING)
        );
      });

      it('Should update the project if it exists and have all the fields valids and files are missing after the first update', async () => {
        const { projectId } = await projectService.updateProjectDetails({
          projectId: 21,
          mission,
          problemAddressed,
          currencyType,
          currency,
          additionalCurrencyInformation
        });
        expect(projectId).toEqual(21);
      });

      it('Should not update the project if it does not exists, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 2,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not update the project if it exists but mission param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but problemAddressed param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but currencyType param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but currency param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but additionalCurrencyInformation param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            legalAgreementFile: pdfFile,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but legalAgreementFile param is missing in the first update and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists but projectProposalFile param is missing in the first update and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetails')
        );
      });

      it('Should not update the project if it exists and have all valid fields but legal agreement file size is bigger than allowed', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: {
              name: 'legalAgreementFile.pdf',
              size: 1231239992
            },
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should not update the project if it exists and have all valid fields but legal agreement file type is not a valid one', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: {
              name: 'legalAgreementFile.json',
              size: 4123
            },
            projectProposalFile: pdfFile
          })
        ).rejects.toThrow(errors.file.DocFileTypeNotValid);
      });

      it('Should not update project detail when the proposal file type is not valid and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: { name: 'proposalFile.json' }
          })
        ).rejects.toThrow(errors.file.DocFileTyPeNotValid);
      });

      it('Should not update project detail when the proposal size is bigger than allowed and throw an error', async () => {
        await expect(
          projectService.updateProjectDetails({
            projectId: 20,
            mission,
            problemAddressed,
            currencyType,
            currency,
            additionalCurrencyInformation,
            legalAgreementFile: pdfFile,
            projectProposalFile: { name: 'proposalFile.pdf', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });
  });

  describe('Project detail', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao, userService });
    });

    describe('Create project detail', () => {
      it('Should create project detail when there is an existent project created and all the needed fields are present', async () => {
        const { projectId } = await projectService.createProjectDetail(1, {
          mission,
          problemAddressed,
          ownerId,
          coverPhoto: file,
          agreementFile: pdfFile,
          proposalFile: docFile
        });
        expect(projectId).toEqual(1);
      });

      it('Should create project detail when there is an existent project created and the optional fields are missing', async () => {
        const { projectId } = await projectService.createProjectDetail(1, {
          mission,
          problemAddressed,
          ownerId,
          coverPhoto: file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not create project detail when there are not all the needed fields, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, { mission })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('createProjectDetail')
        );
      });

      it('Should not create project detail when the owner does not exist, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId: 34,
            coverPhoto: file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });

      it('Should not create project detail when the user is not the owner of the project, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId: 3,
            coverPhoto: file
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });

      it('Should not create project detail when there is not an existent project created, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(2, {
            mission,
            problemAddressed,
            ownerId: 2,
            coverPhoto: file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not create project detail when the cover photo type is not valid, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId,
            coverPhoto: { name: 'hi.json' }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not create project detail when the cover photo size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId,
            coverPhoto: { name: 'hi.jpeg', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should not create project detail when the proposal file type is not valid, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            ownerId,
            mission,
            problemAddressed,
            coverPhoto: file,
            proposalFile: { name: 'hi.json' }
          })
        ).rejects.toThrow(errors.file.DocFileTyPeNotValid);
      });

      it('Should not create project detail when the proposal size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            ownerId,
            mission,
            problemAddressed,
            coverPhoto: file,
            proposalFile: { name: 'hi.pdf', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should not create project detail when the agreement file type is not valid, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            ownerId,
            mission,
            problemAddressed,
            coverPhoto: file,
            agreementFile: { name: 'hi.jpeg' }
          })
        ).rejects.toThrow(errors.file.DocFileTyPeNotValid);
      });

      it('Should not create project detail when the agreement file size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            ownerId,
            mission,
            problemAddressed,
            coverPhoto: file,
            agreementFile: { name: 'hi.doc', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });

    describe('Update project detail', () => {
      it('Should update the project if it exists and all fields are valid', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          mission,
          problemAddressed,
          coverPhoto: file,
          ownerId: 2,
          agreementFile: docFile,
          proposalFile: pdfFile
        });
        expect(projectId).toEqual(1);
      });

      it('Should not update the project whenever the fields are valid but the project is in executing status', async () => {
        await expect(
          projectService.updateProjectDetail(15, {
            mission,
            problemAddressed,
            coverPhoto: file,
            ownerId: 2,
            agreementFile: docFile,
            proposalFile: pdfFile
          })
        ).rejects.toThrow(
          errors.project.ProjectCantBeUpdated(projectStatuses.EXECUTING)
        );
      });

      it('Should update the project if it exists and have all the fields valids and files are missing ', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          mission,
          problemAddressed,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });

      it('Should not update the project if it does not exists, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(2, {
            mission,
            problemAddressed,
            coverPhoto: file,
            ownerId: 2
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });
      it('Should not update the project if it exists but owner param is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            coverPhoto: file
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetail')
        );
      });
      it('Should not update the project if it exists and have all valid fields but cover photo size is bigger than allowed', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            coverPhoto: { name: 'hi.jpeg', size: 1231239992 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
      it('Should not update the project if it exists and have all valid fields but cover photo type is not a valid one', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            coverPhoto: { name: 'hi.json', size: 4123 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });
      it('Should not update the project if owner does not exist', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            coverPhoto: { name: 'hi.jpeg', size: 3123 },
            ownerId: 34
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });
      it('Should not update the project if user is not owner', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            coverPhoto: { name: 'hi.jpeg', size: 3123 },
            ownerId: 3
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
      it('Should not update project detail when the proposal file type is not valid, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            ownerId,
            proposalFile: { name: 'hi.json' }
          })
        ).rejects.toThrow(errors.file.DocFileTyPeNotValid);
      });

      it('Should not update project detail when the proposal size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            ownerId,
            proposalFile: { name: 'hi.pdf', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should not update project detail when the agreement file type is not valid, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            ownerId,
            agreementFile: { name: 'hi.jpeg' }
          })
        ).rejects.toThrow(errors.file.DocFileTyPeNotValid);
      });

      it('Should not update project detail when the agreement file size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            ownerId,
            agreementFile: { name: 'hi.doc', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });

    describe('Get project By ID', () => {
      it('Return the Project By ID', async () => {
        const response = await projectService.getProjectById(1);
        expect(response).toBeDefined();
        expect(response).toBeTruthy();
      });
    });

    describe('Get project detail', () => {
      it('Should return the project detail when the project exists', async () => {
        const response = await projectService.getProjectDetail(1);
        expect(response.mission).toEqual('mission');
        expect(response.problemAddressed).toEqual('the problem');
        expect(response.imgPath).toEqual('detail.jpeg');
      });
      it('Should throw an error when the project does not exist', async () => {
        await expect(projectService.getProjectDetail(0)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 0)
        );
      });
    });
  });

  describe('Project proposal', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao, userService });
    });

    describe('Update project proposal', () => {
      it('Should update the project when the project exists and all the fields are valid', async () => {
        const { projectId } = await projectService.updateProjectProposal(
          consensusProject.id,
          {
            proposal,
            ownerId: 2
          }
        );

        expect(projectId).toEqual(consensusProject.id);
      });

      it('Should not update the project whenever the fields are valid but the project is in executing status', async () => {
        await expect(
          projectService.updateProjectProposal(15, {
            proposal,
            ownerId: 2
          })
        ).rejects.toThrow(
          errors.project.ProjectCantBeUpdated(projectStatuses.EXECUTING)
        );
      });

      it('Should not update the project when it does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(2, {
            proposal,
            ownerId: 2
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not update the project when the project exists but proposal is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, { ownerId: 2 })
        ).rejects.toThrow(COAError);
      });

      it('Should not update the project when the project exists, all fields are valid but owner does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, {
            proposal,
            ownerId: 34
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });

      it('Should not update the project when user is not owner, and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, {
            proposal,
            ownerId: 3
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
    });

    describe('Get project proposal', () => {
      it('Should return project proposal when the project exists', async () => {
        const response = await projectService.getProjectProposal(1);
        expect(response.proposal).toEqual('proposal');
      });

      it('Should throw an error when the project does not exist, and throw an error', async () => {
        await expect(projectService.getProjectProposal(2)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 2)
        );
      });
    });
  });
  describe('Get projects', () => {
    beforeEach(() => {
      dbUserProject.push({
        id: 1,
        project: pendingProject.id,
        role: beneficiaryRole.id,
        user: 1
      });
      dbRole.push(beneficiaryRole);
      dbUser.push({
        id: 1,
        firstName: 'name',
        lastName: 'lastName'
      });
    });

    it('Should return an empty list if there are no existing projects', async () => {
      beforeAll(() => restoreProjectService());
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: () => []
        }),
        roleService,
        userProjectService
      });
      await expect(projectService.getProjects()).resolves.toHaveLength(0);
    });
    it('Should return an array of projects if there is any project', async () => {
      beforeAll(() => restoreProjectService());
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: () => [pendingProject]
        }),
        roleService,
        userProjectService
      });
      const projects = await projectService.getProjects();
      expect(projects).toHaveLength(1);
      expect(projects).toMatchSnapshot();
    });
    it('Should return projects with no present beneficiary', async () => {
      beforeAll(() => restoreProjectService());
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: () => [consensusProject]
        }),
        roleService,
        userProjectService
      });
      const projects = await projectService.getProjects();
      expect(projects).toHaveLength(1);
      expect(projects).toMatchSnapshot();
    });
  });

  describe('Process milestone file', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        milestoneDao,
        projectDao,
        milestoneService
      });
    });
    it('Should create milestones and activities to an existent project without an already process file', async () => {
      const { projectId } = await projectService.processMilestoneFile(1, {
        file: milestoneFile,
        ownerId: 2
      });
      expect(projectId).toEqual(1);
    });
    it('Should not create milestones and activities to a non-existent project, and throw an error', async () => {
      await expect(
        projectService.processMilestoneFile(2, {
          file: milestoneFile,
          ownerId: 2
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
    });
    it('Should not create milestones and activities to an existent project with status different than new or rejected', async () => {
      await expect(
        projectService.processMilestoneFile(3, {
          file: milestoneFile,
          ownerId: 2
        })
      ).rejects.toThrow(
        errors.project.InvalidStatusForMilestoneFileProcess(
          projectStatuses.TO_REVIEW
        )
      );
    });
    it('Should not create milestones and activities to an existent project whenever user is not the owner of it', async () => {
      await expect(
        projectService.processMilestoneFile(1, {
          file: milestoneFile,
          ownerId: 5
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });
    it('Should not create milestones and activities to an existent project whenever the file type is not valid', async () => {
      await expect(
        projectService.processMilestoneFile(1, {
          file: { name: 'project.pdf', size: 1234 },
          ownerId: 2
        })
      ).rejects.toThrow(errors.file.MilestoneFileTypeNotValid);
    });
    it('Should remove previuos milestones to an existent project if it already has a milestone file', async () => {
      const { projectId } = await projectService.processMilestoneFile(10, {
        file: { name: 'project.xls', size: 1234 },
        ownerId: 2
      });
      expect(projectId).toEqual(10);
    });
  });

  describe('Get project milestones', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        milestoneService,
        projectDao,
        userService
      });
    });

    it('Should return project milestones of an existent project', async () => {
      const milestones = await projectService.getProjectMilestones(3);
      expect(milestones).toHaveLength(1);
      expect(milestones[0].id).toEqual(2);
    });
    it('Should not return project milestones of a non-existent project, and throw an error', async () => {
      await expect(projectService.getProjectMilestones(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });
  // TODO whenever mail is answered describe('Project milestone activities', () => {});

  describe('Get projects by owner', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: filter => {
            const projects = [
              { id: 1, owner: 3 },
              { id: 2, owner: 2 },
              { id: 3, owner: 3 }
            ];
            return projects.filter(
              project => project.owner === filter.where.owner
            );
          }
        })
      });
    });

    it('should return an array of projects for the specified onwer', async () => {
      const response = await projectService.getProjectsByOwner(3);
      expect(response).toHaveLength(2);
    });

    it('should return an empty array of projects if none were found', async () => {
      const response = await projectService.getProjectsByOwner(0);
      expect(response).toHaveLength(0);
    });
  });

  describe('Get public projects', () => {
    let dbProject = [
      { id: 1, status: projectStatuses.EXECUTING },
      { id: 2, status: projectStatuses.NEW },
      { id: 3, status: projectStatuses.DELETED },
      { id: 3, status: projectStatuses.FINISHED }
    ];
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: filter =>
            dbProject.filter(project =>
              Object.keys(filter).every(key => {
                if (filter[key].in) {
                  return filter[key].in.includes(project[key]);
                }
                return project[key] === filter[key];
              })
            )
        })
      });
    });

    it('should return an array of projects with public statuses', async () => {
      const response = await projectService.getPublicProjects();
      expect(response).toHaveLength(2);
    });

    it('should return an empty array if no public projects were found', async () => {
      dbProject = [
        { id: 2, status: projectStatuses.NEW },
        { id: 3, status: projectStatuses.DELETED }
      ];
      const response = await projectService.getPublicProjects();
      expect(response).toHaveLength(0);
    });
  });

  describe('Generate project agreement', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        milestoneService,
        transferService,
        projectDao
      });
    });

    it('should return a stringified JSON with the project information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.name).toEqual(executingProject.projectName);
      expect(parsedResponse.mission).toEqual(executingProject.mission);
      expect(parsedResponse.problem).toEqual(executingProject.problemAddressed);
    });

    it('should return a stringified JSON with the milestones and tasks information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.milestones).toHaveLength(1);
      expect(parsedResponse.milestones[0].goal).toEqual(5000);
      expect(parsedResponse.milestones[0].tasks).toHaveLength(3);
      expect(parsedResponse.milestones[0].tasks[0].id).toEqual(
        sha3(executingProject.id, '0x11111111', 1)
      );
    });

    it('should return a stringified JSON with the funders information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.funders).toHaveLength(1);
      expect(parsedResponse.funders[0].address).toEqual(supporterUser.address);
    });

    it(
      'should not return duplicated funders if there is ' +
        'more than one transfer sent by the same user',
      async () => {
        verifiedTransfers.push({
          id: 2,
          sender: supporterUser,
          status: txFunderStatus.VERIFIED
        });
        const response = await projectService.generateProjectAgreement(
          executingProject.id
        );
        const parsedResponse = JSON.parse(response);
        expect(parsedResponse.funders).toHaveLength(1);
      }
    );

    it('should throw an error if the project does not exist', async () => {
      await expect(projectService.generateProjectAgreement(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });

  describe('Get users related to a project', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao
      });
    });
    it(
      'should return an object with the information ' +
        'of the users related to the project',
      async () => {
        const response = await projectService.getProjectUsers(
          consensusProject.id
        );
        expect(response.owner).toEqual(entrepreneurUser);
        expect(response.followers).toHaveLength(1);
        expect(response.funders).toHaveLength(1);
        expect(response.oracles).toHaveLength(2);
      }
    );

    it('should throw an error if the project does not exist', async () => {
      await expect(projectService.getProjectUsers(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });

  describe('Send project to review', () => {
    const executingProjectToReview = {
      id: 1,
      status: projectStatuses.EXECUTING,
      revision: 1,
      parentId: null
    };
    const openReviewProjectToReview = {
      id: 2,
      status: projectStatuses.OPEN_REVIEW,
      revision: 1,
      parentId: null
    };

    beforeEach(() => {
      dbProject = [];
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign(
          {},
          {
            findById: projectId =>
              dbProject.find(project => project.id === projectId),
            updateProject: (toUpdate, id) => {
              const found = dbProject.find(project => project.id === id);
              if (!found) return;
              const updated = { ...found, ...toUpdate };
              dbProject[dbProject.indexOf(found)] = updated;
              return updated;
            }
          }
        ),
        userProjectService,
        changelogService
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should change project status to review successfully', async () => {
      dbProject.push(openReviewProjectToReview);

      jest
        .spyOn(userProjectService, 'validateUserWithRoleInProject')
        .mockResolvedValue();

      const response = await projectService.sendProjectToReview({
        user: { id: 1, firstName: 'Pedro', lastName: 'Gonzalez' },
        projectId: 2
      });

      expect(response).toEqual({
        success: true
      });
    });

    it('should throw an error if transition is not valid', async () => {
      dbProject.push(executingProjectToReview);

      jest
        .spyOn(userProjectService, 'validateUserWithRoleInProject')
        .mockResolvedValue();

      await expect(
        projectService.sendProjectToReview({
          user: { id: 1, firstName: 'Pedro', lastName: 'Gonzalez' },
          projectId: 1
        })
      ).rejects.toThrow(errors.project.InvalidProjectTransition);
    });

    it('should throw an error if user is not beneficiary or funder of the project', async () => {
      dbProject.push(openReviewProjectToReview);

      jest
        .spyOn(userProjectService, 'validateUserWithRoleInProject')
        .mockImplementation(({ error }) => {
          throw new COAError(error);
        });

      await expect(
        projectService.sendProjectToReview({
          user: { id: 1, firstName: 'Pedro', lastName: 'Gonzalez' },
          projectId: 2
        })
      ).rejects.toThrow(errors.project.UserCanNotMoveProjectToReview);
    });
  });

  describe('Update project status', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao,
        notifyProjectStatusChange: jest.fn()
      });
    });
    it(
      'should update a project if the status transition is valid ' +
        'and not call notifyProjectStatusChange',
      async () => {
        const response = await projectService.updateProjectStatus(
          entrepreneurUser,
          draftProject.id,
          projectStatuses.TO_REVIEW
        );
        expect(projectService.notifyProjectStatusChange).not.toHaveBeenCalled();
        expect(response).toEqual({ projectId: draftProject.id });
      }
    );
    it(
      'should update a project if the status transition is valid ' +
        'and call notifyProjectStatusChange',
      async () => {
        const response = await projectService.updateProjectStatus(
          curatorUser,
          pendingProject.id,
          projectStatuses.PUBLISHED
        );
        expect(projectService.notifyProjectStatusChange).toHaveBeenCalled();
        expect(response).toEqual({ projectId: pendingProject.id });
      }
    );
    it('should throw an error if required params are missing', async () => {
      await expect(
        projectService.updateProjectStatus(
          undefined,
          draftProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('updateProjectStatus')
      );
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          0,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
    it('should throw an error if the status transition does not exist', async () => {
      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          pendingProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.project.InvalidProjectTransition);
    });
    it('should throw an error if the transition validator fails', async () => {
      validators.fromNew.mockImplementation(() => {
        throw new COAError(errors.project.IsNotCompleted);
      });

      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          draftProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.project.IsNotCompleted);
    });
    it('should throw an error if rejectionReason is undefined for rejected status', async () => {
      validators.fromNew.mockImplementation(() => {
        throw new COAError(errors.project.IsNotCompleted);
      });

      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          consensusProject.id,
          projectStatuses.REJECTED,
          undefined
        )
      ).rejects.toThrow(
        errors.project.RejectionReasonEmpty(consensusProject.id)
      );
    });
    it(
      'should update a project from to review to consensus if the status transition is valid and user is Admin ' +
        'and call notifyProjectStatusChange',
      async () => {
        const response = await projectService.updateProjectStatus(
          adminUser,
          toReviewProject.id,
          projectStatuses.CONSENSUS
        );
        expect(projectService.notifyProjectStatusChange).toHaveBeenCalled();
        expect(response).toEqual({ projectId: toReviewProject.id });
      }
    );
  });

  describe('Get featured projects', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        featuredProjectDao: Object.assign(
          {},
          {
            findAllByProps: () => {
              const projects = [
                { id: 1, project: pendingProject },
                { id: 2, project: executingProject },
                { id: 3, project: consensusProject }
              ];
              return projects;
            }
          }
        )
      });
    });

    it('should return a list of all featured projects', async () => {
      const response = await projectService.getFeaturedProjects();
      expect(response).toHaveLength(3);
      expect(response).toEqual([
        { ...pendingProject },
        { ...executingProject },
        { ...consensusProject }
      ]);
    });
  });

  describe('Transition Consensus Projects', () => {
    let dbProject = [];
    const consensusToFunding = {
      id: 1,
      status: projectStatuses.CONSENSUS,
      owner: 1
    };
    const consensusToRejected = {
      id: 2,
      status: projectStatuses.CONSENSUS,
      owner: 1
    };
    const consensusTimeNoPassed = {
      id: 3,
      status: projectStatuses.CONSENSUS,
      owner: 1
    };
    beforeEach(() => {
      dbProject = [];
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign(
          {},
          {
            findAllByProps: () =>
              dbProject.filter(
                project => project.status === projectStatuses.CONSENSUS
              ),
            updateProject: (toUpdate, id) => {
              const found = dbProject.find(project => project.id === id);
              if (!found) return;
              const updated = { ...found, ...toUpdate };
              dbProject[dbProject.indexOf(found)] = updated;
              return updated;
            }
          }
        ),
        hasTimePassed: project => {
          if (project.id === 3) return false;
          return true;
        },
        getNextValidStatus: (project, successStatus, failStatus) => {
          if (project.id === 1) return successStatus;
          return failStatus;
        },
        notifyProjectStatusChange: jest.fn()
      });
      coa.createProject = jest.fn(() => ({ hash: '0x01' }));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it(
      'should create the project in the blockchain and save the tx hash ' +
        'when changing to funding, return its id and new status ' +
        'without updating the status in db',
      async () => {
        dbProject.push(consensusToFunding);
        coa.createProject.mockReturnValueOnce({ hash: '0x00' });
        const response = await projectService.transitionConsensusProjects();
        expect(response).toHaveLength(1);
        expect(response).toEqual([
          {
            projectId: consensusToFunding.id,
            newStatus: projectStatuses.FUNDING
          }
        ]);
        const updated = dbProject.find(
          project => project.id === consensusToFunding.id
        );
        expect(updated.status).toEqual(projectStatuses.CONSENSUS);
        expect(updated.txHash).toEqual('0x00');
        expect(projectService.notifyProjectStatusChange).not.toHaveBeenCalled();
      }
    );

    it(
      'should change the project status to rejected if the validator fails ' +
        'call notifyProjectStatusChange once',
      async () => {
        dbProject.push(consensusToRejected);
        validators.fromConsensus.mockImplementationOnce(({ project }) => {
          throw new COAError(errors.project.NotAllOraclesAssigned(project.id));
        });
        const response = await projectService.transitionConsensusProjects();
        expect(response).toHaveLength(1);
        expect(response).toEqual([
          {
            projectId: consensusToRejected.id,
            newStatus: projectStatuses.REJECTED
          }
        ]);
        const updated = dbProject.find(
          project => project.id === consensusToRejected.id
        );
        expect(updated.status).toEqual(projectStatuses.REJECTED);
        expect(projectService.notifyProjectStatusChange).toHaveBeenCalled();
      }
    );

    it('should not update the project if the consensus time has not passed', async () => {
      dbProject.push(consensusTimeNoPassed);
      const response = await projectService.transitionConsensusProjects();
      expect(response).toHaveLength(0);
      const notUpdated = dbProject.find(
        project => project.id === consensusTimeNoPassed.id
      );
      expect(notUpdated.status).toEqual(projectStatuses.CONSENSUS);
      expect(projectService.notifyProjectStatusChange).not.toHaveBeenCalled();
    });

    it(
      'should return an array with the projects that were ' +
        'changed to funding and to rejected, omit the ones not ready, ' +
        ' and call notifyProjectStatusChange for every rejected',
      async () => {
        dbProject.push(
          consensusToFunding,
          consensusToRejected,
          consensusTimeNoPassed
        );

        validators.fromConsensus.mockImplementationOnce(({ project }) => {
          throw new COAError(errors.project.NotAllOraclesAssigned(project.id));
        });
        const response = await projectService.transitionConsensusProjects();
        expect(response).toHaveLength(2);
        expect(response).toEqual([
          {
            projectId: 1,
            newStatus: projectStatuses.FUNDING
          },
          {
            projectId: 2,
            newStatus: projectStatuses.REJECTED
          }
        ]);

        expect(projectService.notifyProjectStatusChange).toBeCalledTimes(1);
      }
    );
  });

  describe('Transition Funding Projects', () => {
    let dbProject = [];
    const dbProjectFunder = [];
    const fundingToExecuting = {
      id: 1,
      status: projectStatuses.FUNDING,
      projectName: 'toExecutingProject',
      owner: 1
    };
    const fundingToConsensus = {
      id: 2,
      status: projectStatuses.FUNDING
    };
    const fundingTimeNoPassed = {
      id: 3,
      status: projectStatuses.FUNDING
    };

    beforeEach(async () => {
      dbProject = [];
      dbProjectFunder.push(
        {
          id: 1,
          project: 2,
          user: 10
        },
        {
          id: 2,
          project: 3,
          user: 11
        }
      );
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign(
          {},
          {
            findAllByProps: () => {
              const projects = dbProject.filter(
                project => project.status === projectStatuses.FUNDING
              );
              return projects.map(project => ({
                ...project,
                funders: dbProjectFunder.filter(pf => pf.project === project.id)
              }));
            },
            updateProject: (toUpdate, id) => {
              const found = dbProject.find(project => project.id === id);
              if (!found) return;
              const updated = { ...found, ...toUpdate };
              dbProject[dbProject.indexOf(found)] = updated;
              return updated;
            }
          }
        ),
        funderDao: Object.assign(
          {},
          {
            deleteFundersByProject: (projectId, _) => {
              const found = dbProjectFunder.find(
                funder => funder.project === projectId
              );
              if (!found) return;
              dbProjectFunder.splice(dbProjectFunder.indexOf(found), 1);
              return found;
            }
          }
        ),
        milestoneService: {
          getAllMilestonesByProject: jest.fn(),
          setClaimable: jest.fn()
        },
        hasTimePassed: project => {
          if (project.id === 3) return false;
          return true;
        },
        getNextValidStatus: (project, successStatus, failStatus) => {
          if (project.id === 1) return successStatus;
          return failStatus;
        },
        removeFundersWithNoTransfersFromProject: jest.fn(),
        removeOraclesWithoutActivitiesFromProject: jest.fn(),
        generateProjectAgreement: jest.fn(() => 'agreementJson'),
        notifyProjectStatusChange: jest.fn()
      });
      coa.addProjectAgreement = jest.fn(() => ({ hash: '0x01' }));
    });

    it(
      'should generate the project agreement and add it to the blockchain, ' +
        'set the first milestone as claimable, update the project status in db, ' +
        'send notifications and return its id and new status ' +
        'when changing to executing',
      async () => {
        dbProject.push(fundingToExecuting);
        projectService.milestoneService.getAllMilestonesByProject.mockReturnValueOnce(
          [{ id: 1 }, { id: 2 }]
        );
        const response = await projectService.transitionFundingProjects();
        expect(response).toHaveLength(1);
        expect(response).toEqual([
          {
            projectId: fundingToExecuting.id,
            newStatus: projectStatuses.EXECUTING
          }
        ]);
        const updated = dbProject.find(p => p.id === fundingToExecuting.id);
        expect(updated.status).toEqual(projectStatuses.EXECUTING);
        expect(coa.addProjectAgreement).toHaveBeenCalled();
        expect(projectService.milestoneService.setClaimable).toBeCalledTimes(1);
        expect(projectService.notifyProjectStatusChange).toHaveBeenCalled();
      }
    );

    it(
      'should change the project status to consensus and remove all project funders' +
        'if the validator fails and call notifyProjectStatusChange',
      async () => {
        dbProject.push(fundingToConsensus);
        const response = await projectService.transitionFundingProjects();
        expect(response).toHaveLength(1);
        expect(response).toEqual([
          {
            projectId: fundingToConsensus.id,
            newStatus: projectStatuses.CONSENSUS
          }
        ]);
        const updated = dbProject.find(
          project => project.id === fundingToConsensus.id
        );
        expect(updated.status).toEqual(projectStatuses.CONSENSUS);
        expect(projectService.notifyProjectStatusChange).toHaveBeenCalled();
        expect(
          dbProjectFunder.filter(
            funder => funder.projectId === fundingToConsensus.id
          )
        ).toEqual([]);
      }
    );

    it('should not update the project if the consensus time has not passed', async () => {
      dbProject.push(fundingTimeNoPassed);
      const response = await projectService.transitionFundingProjects();
      expect(response).toHaveLength(0);
      const updated = dbProject.find(
        project => project.id === fundingTimeNoPassed.id
      );
      expect(updated.status).toEqual(projectStatuses.FUNDING);
      expect(projectService.notifyProjectStatusChange).not.toHaveBeenCalled();
    });

    it(
      'should return an array with the projects that were ' +
        'changed to consensus and to executing, omit the ones not ready ' +
        'and call notifyProjectStatusChange for each change',
      async () => {
        dbProject.push(
          fundingToExecuting,
          fundingToConsensus,
          fundingTimeNoPassed
        );
        const response = await projectService.transitionFundingProjects();
        expect(response).toHaveLength(2);
        expect(response).toEqual([
          {
            projectId: 1,
            newStatus: projectStatuses.EXECUTING
          },
          {
            projectId: 2,
            newStatus: projectStatuses.CONSENSUS
          }
        ]);
        expect(projectService.notifyProjectStatusChange).toBeCalledTimes(2);
      }
    );
  });

  describe('Has time passed', () => {
    const SECONDS_IN_A_DAY = 86400;
    const TODAY = new Date();
    const YESTERDAY = new Date(TODAY).setDate(TODAY.getDate() - 1);

    beforeAll(() => restoreProjectService());

    it(
      'should return true if a day has passed since last updated ' +
        'when project is in consensus phase',
      () => {
        expect(
          projectService.hasTimePassed({
            lastUpdatedStatusAt: YESTERDAY,
            status: projectStatuses.CONSENSUS,
            consensusSeconds: SECONDS_IN_A_DAY
          })
        ).toBe(true);
      }
    );

    it(
      'should return true if a day has passed since last updated ' +
        'when project is in funding phase',
      () => {
        expect(
          projectService.hasTimePassed({
            lastUpdatedStatusAt: YESTERDAY,
            status: projectStatuses.FUNDING,
            fundingSeconds: SECONDS_IN_A_DAY
          })
        ).toBe(true);
      }
    );

    it('should return false if a day has not passed since last updated', () => {
      expect(
        projectService.hasTimePassed({
          lastUpdatedStatusAt: TODAY,
          status: projectStatuses.CONSENSUS,
          consensusSeconds: SECONDS_IN_A_DAY
        })
      ).toBe(false);
    });

    it('should return false if the project is not in consensus or funding phase', () => {
      expect(
        projectService.hasTimePassed({
          lastUpdatedStatusAt: YESTERDAY,
          status: projectStatuses.EXECUTING,
          consensusSeconds: SECONDS_IN_A_DAY
        })
      ).toBe(false);
    });

    it('should return false if it is invoked without params', () => {
      expect(projectService.hasTimePassed()).toBe(false);
    });
  });

  describe('Get next valid status', () => {
    it('should return the success status if the validation does not fail', async () => {
      validators.fromFunding.mockReturnValueOnce(true);
      await expect(
        projectService.getNextValidStatus(
          {
            id: 1,
            status: projectStatuses.FUNDING,
            owner: 1
          },
          projectStatuses.EXECUTING,
          projectStatuses.CONSENSUS
        )
      ).resolves.toEqual(projectStatuses.EXECUTING);
    });

    it('should return the fail status if the validation not fails', async () => {
      validators.fromFunding.mockImplementationOnce(() => {
        throw new COAError(errors.project.MinimumFundingNotReached(1));
      });
      await expect(
        projectService.getNextValidStatus(
          {
            id: 1,
            status: projectStatuses.FUNDING,
            owner: 1
          },
          projectStatuses.EXECUTING,
          projectStatuses.CONSENSUS
        )
      ).resolves.toEqual(projectStatuses.CONSENSUS);
    });
  });

  describe('Remove funders with no transfers', () => {
    let dbTransfer = [];
    let dbProjectFunder = [];
    const funderUser = {
      id: 1,
      role: userRoles.PROJECT_SUPPORTER
    };
    const noFunderUser = {
      id: 2,
      role: userRoles.PROJECT_SUPPORTER
    };
    const fundingProject = {
      id: 1,
      status: projectStatuses.FUNDING,
      owner: 1,
      funders: [funderUser, noFunderUser]
    };
    const verifiedTransfer = {
      id: 1,
      sender: funderUser.id,
      status: txFunderStatus.VERIFIED,
      project: fundingProject.id
    };

    beforeEach(() => {
      dbProjectFunder = [];
      dbTransfer = [];
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        transferService: Object.assign(
          {},
          {
            getAllTransfersByProps: () =>
              dbTransfer.filter(
                transfer =>
                  transfer.project === fundingProject.id &&
                  transfer.status === txFunderStatus.VERIFIED
              )
          }
        ),
        funderDao: Object.assign(
          {},
          {
            deleteFundersByProject: (projectId, filters) => {
              const found = dbProjectFunder.find(
                funder =>
                  funder.user === filters.user && funder.project === projectId
              );
              if (!found) return;
              dbProjectFunder.splice(dbProjectFunder.indexOf(found), 1);
              return found;
            }
          }
        )
      });
    });

    it(
      'should remove the funders with no verified transfers ' +
        'from the project and return their ids',
      async () => {
        dbTransfer.push(verifiedTransfer);
        dbProjectFunder.push(
          {
            id: 1,
            project: fundingProject.id,
            user: funderUser.id
          },
          {
            id: 2,
            project: fundingProject.id,
            user: noFunderUser.id
          }
        );
        const response = await projectService.removeFundersWithNoTransfersFromProject(
          fundingProject
        );
        expect(response).toHaveLength(1);
        expect(response).toEqual([noFunderUser.id]);
        const wasDeleted = !dbTransfer.find(
          transfer => transfer.sender === noFunderUser.id
        );
        expect(wasDeleted).toBe(true);
      }
    );

    it('should return an empty array if the project has no funders assigned', async () => {
      const response = await projectService.removeFundersWithNoTransfersFromProject(
        fundingProject
      );
      expect(response).toHaveLength(0);
    });

    it('should return an empty array if all funders made transfers', async () => {
      dbTransfer.push(verifiedTransfer);
      dbProjectFunder.push({
        id: 1,
        project: fundingProject.id,
        user: funderUser.id
      });
      const response = await projectService.removeFundersWithNoTransfersFromProject(
        fundingProject
      );
      expect(response).toHaveLength(0);
    });
  });

  describe('Remove oracles without activities', () => {
    let dbTasks = [];
    let dbProjectOracle = [];
    let oracles = [];
    const consensusProjectWithOracles = {
      id: 1,
      status: projectStatuses.CONSENSUS
    };
    const oracleUser = { id: 1 };
    const noOracleUser = { id: 2 };
    beforeEach(() => {
      dbProjectOracle = [];
      dbTasks = [];
      oracles = [];
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        getAllOraclesWithTasksFromProject: () => {
          oracles = dbTasks
            .filter(task => task.projectId === consensusProjectWithOracles.id)
            .map(task => task.oracleId);
          return oracles;
        },
        oracleDao: Object.assign(
          {},
          {
            removeCandidatesByProps: () =>
              dbProjectOracle
                .filter(p => !oracles.includes(p.user))
                .map(p => p.id)
          }
        )
      });
    });

    it(
      'should remove the oracles with no activities ' +
        'from the project and return their ids',
      async () => {
        dbTasks.push({
          id: 1,
          projectId: consensusProjectWithOracles.id,
          oracleId: 1
        });
        dbProjectOracle.push(
          {
            id: 1,
            project: consensusProjectWithOracles.id,
            user: oracleUser.id
          },
          {
            id: 2,
            project: consensusProjectWithOracles.id,
            user: noOracleUser.id
          }
        );
        const response = await projectService.removeOraclesWithoutActivitiesFromProject(
          consensusProjectWithOracles.id
        );
        expect(response).toHaveLength(1);
        expect(response).toEqual([noOracleUser.id]);
      }
    );

    it('should return an empty array if the project has no oracles assigned', async () => {
      const response = await projectService.removeOraclesWithoutActivitiesFromProject(
        consensusProjectWithOracles.id
      );
      expect(response).toHaveLength(0);
    });

    it('should return an empty array if all oracles are assigned to activities', async () => {
      dbTasks.push({
        id: 1,
        projectId: consensusProjectWithOracles.id,
        oracleId: 1
      });
      dbProjectOracle.push({
        id: 1,
        project: consensusProjectWithOracles.id,
        user: oracleUser.id
      });
      const response = await projectService.removeOraclesWithoutActivitiesFromProject(
        consensusProjectWithOracles.id
      );
      expect(response).toHaveLength(0);
    });
  });

  describe('Test applyToProject', () => {
    beforeEach(() => {
      resetDb();
      dbUser.push(supporterUser);
      dbProject.push(consensusProject);
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: {
          findOneByProps: ({ id }, { oracles, funders }) => {
            const [foundProject] = dbProject.filter(
              project => project.id === id
            );

            if (!foundProject) return;

            return Object.assign({}, foundProject, {
              oracles:
                oracles &&
                dbProjectOracle
                  .filter(po => po.project === id)
                  .map(({ user }) => dbUser.find(u => u.id === user)),
              funders:
                funders &&
                dbProjectFunder
                  .filter(po => po.project === id)
                  .map(({ user }) => dbUser.find(u => u.id === user))
            });
          }
        },
        userService: {
          getUserById: id => {
            const found = dbUser.find(user => user.id === id);
            if (!found)
              throw new COAError(errors.common.CantFindModelWithId('user', id));
            return found;
          }
        },
        oracleDao: {
          addCandidate: ({ project, user }) => {
            dbProjectOracle.push({
              id: dbProjectOracle.length + 1,
              project,
              user
            });

            return { id: dbProjectOracle.length };
          }
        },
        funderDao: {
          addCandidate: ({ project, user }) => {
            dbProjectFunder.push({
              id: dbProjectFunder.length + 1,
              project,
              user
            });

            return { id: dbProjectFunder.length };
          }
        }
      });
    });

    it('should add a new oracle candidate and returns its id', async () => {
      const response = await projectService.applyToProject({
        projectId: consensusProject.id,
        userId: supporterUser.id,
        role: supporterRoles.ORACLES
      });

      expect(response.candidateId).toBeDefined();
    });

    it('should add a new funder candidate and returns its id', async () => {
      const response = await projectService.applyToProject({
        projectId: consensusProject.id,
        userId: supporterUser.id,
        role: supporterRoles.FUNDERS
      });

      expect(response.candidateId).toBeDefined();
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        projectService.applyToProject({
          userId: supporterUser.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('applyToProject'));
    });

    it('should throw an error if the project does not exist', async () => {
      await expect(
        projectService.applyToProject({
          userId: supporterUser.id,
          projectId: 0,
          role: supporterRoles.ORACLES
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(pendingProject);

      await expect(
        projectService.applyToProject({
          userId: supporterUser.id,
          projectId: pendingProject.id,
          role: supporterRoles.FUNDERS
        })
      ).rejects.toThrow(
        errors.project.CantApplyToProject(projectStatuses.TO_REVIEW)
      );
    });

    it('should throw an error if the user is not supporter', async () => {
      dbUser.push(entrepreneurUser);

      await expect(
        projectService.applyToProject({
          userId: entrepreneurUser.id,
          projectId: consensusProject.id,
          role: supporterRoles.FUNDERS
        })
      ).rejects.toThrow(
        errors.user.UnauthorizedUserRole(entrepreneurUser.role)
      );
    });

    it('should throw an error if the user already apply to the project as funder', async () => {
      dbProjectFunder.push({
        id: 1,
        project: consensusProject.id,
        user: supporterUser.id
      });

      await expect(
        projectService.applyToProject({
          userId: supporterUser.id,
          projectId: consensusProject.id,
          role: supporterRoles.FUNDERS
        })
      ).rejects.toThrow(
        errors.project.AlreadyApplyToProject(supporterRoles.FUNDERS)
      );
    });
  });

  describe('Get address', () => {
    let dbProject = [];
    const projectWithAddress = {
      id: 1,
      status: projectStatuses.EXECUTING,
      address: '0x0'
    };
    beforeEach(() => {
      dbProject = [];
    });
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        projectDao: Object.assign(
          {},
          {
            findById: id => dbProject.find(project => project.id === id)
          }
        )
      });
    });

    it('should return the existing user', async () => {
      dbProject.push(projectWithAddress);
      const response = await projectService.getAddress(projectWithAddress.id);
      expect(response).toEqual(projectWithAddress.address);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(projectService.getAddress(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });

  describe('Notify project status change', () => {
    const projectOwner = { id: 1, email: 'owner@coa.com' };
    let projectFollowers = [];
    let projectFunders = [];
    let projectOracles = [];

    beforeEach(() => {
      projectFollowers = [];
      projectFunders = [];
      projectOracles = [];
    });
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        mailService,
        getProjectUsers: () => ({
          owner: projectOwner,
          followers: projectFollowers,
          funders: projectFunders,
          oracles: projectOracles
        })
      });
    });

    it('should call mailService sendProjectStatusChangeMail with the owner email', async () => {
      await projectService.notifyProjectStatusChange(
        consensusProject,
        projectStatuses.FUNDING
      );
      expect(mailService.sendProjectStatusChangeMail).toBeCalledWith({
        to: projectOwner.email,
        bodyContent: expect.anything()
      });
    });

    it(
      'should call mailService sendProjectStatusChangeMail for the owner ' +
        'and once for each follower',
      async () => {
        projectFollowers = [
          {
            id: 2,
            email: 'follower@test.com'
          },
          { id: 3, email: 'follower2@test.com' }
        ];
        await projectService.notifyProjectStatusChange(
          consensusProject,
          projectStatuses.FUNDING
        );
        expect(mailService.sendProjectStatusChangeMail).toBeCalledTimes(3);
      }
    );
    it(
      'should call mailService sendProjectStatusChangeMail for the owner ' +
        'and once for each unique supporter',
      async () => {
        projectFunders = [
          {
            id: 2,
            email: 'funder@test.com'
          },
          { id: 3, email: 'supporter@test.com' }
        ];
        projectOracles = [
          { id: 3, email: 'supporter@test.com' },
          {
            id: 4,
            email: 'oracle@test.com'
          }
        ];
        await projectService.notifyProjectStatusChange(
          consensusProject,
          projectStatuses.FUNDING
        );
        expect(mailService.sendProjectStatusChangeMail).toBeCalledTimes(4);
      }
    );
  });

  describe('Calculate goal amount from milestones', () => {
    it('should return the goal amount as the sum of all tasks budgets', () => {
      const milestones = [
        {
          tasks: [{ budget: 200 }, { budget: 300 }]
        },
        { tasks: [{ budget: 150 }] }
      ];
      const response = projectService.calculateGoalAmountFromMilestones(
        milestones
      );
      expect(response).toEqual(650);
    });
    it('should return 0 when an empty array is passed', () => {
      const response = projectService.calculateGoalAmountFromMilestones([]);
      expect(response).toEqual(0);
    });
  });

  describe('Testing getBlockchainData method', () => {
    const blockResponse = {
      timestamp: 1587146117347
    };
    const txResponse = {
      blockNumber: 10
    };
    let dbProject = [];
    beforeAll(() => {
      injectMocks(projectService, {
        projectDao: {
          findById: id => dbProject.find(p => p.id === id)
        }
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbProject.push(pendingProject, executingProject);
    });

    afterAll(() => restoreProjectService());
    it('should return the transfer blockchain data', async () => {
      coa.getBlock.mockReturnValueOnce(blockResponse);
      coa.getTransactionResponse.mockReturnValueOnce(txResponse);
      const response = await projectService.getBlockchainData(
        executingProject.id
      );
      expect(response).toEqual({
        txHash: executingProject.txHash,
        txHashUrl: txExplorerHelper.buildTxURL(executingProject.txHash),
        address: executingProject.address,
        addressUrl: txExplorerHelper.buildAddressURL(executingProject.address),
        creationDate: new Date(blockResponse.timestamp * 1000),
        blockNumber: txResponse.blockNumber,
        blockNumberUrl: txExplorerHelper.buildBlockURL(txResponse.blockNumber),
        agreement: undefined
      });
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(projectService.getBlockchainData(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
    it('should throw an error if the project does not have a txHash', async () => {
      await expect(
        projectService.getBlockchainData(pendingProject.id)
      ).rejects.toThrow(
        errors.project.BlockchainInfoNotFound(pendingProject.id)
      );
    });
    it('should throw an error if the transaction does not exist', async () => {
      coa.getTransactionResponse.mockReturnValueOnce(null);
      await expect(
        projectService.getBlockchainData(executingProject.id)
      ).rejects.toThrow(
        errors.project.BlockchainInfoNotFound(executingProject.id)
      );
    });
  });

  describe('Get project with transfers', () => {
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, { projectDao, userService });
    });
    it('Should return projects array with at least one transfer', async () => {
      const response = await projectService.getProjectsWithTransfers();
      expect(response).toEqual([projectWithTransfer]);
    });
  });

  describe('Transition Finished Projects', () => {
    let dbProject = [];
    let dbMilestones = [];
    const executingWithNoCompletedMilestones = {
      id: 1,
      status: projectStatuses.EXECUTING
    };
    const executingToFinished = {
      id: 2,
      status: projectStatuses.EXECUTING
    };
    const pendingMilestone = {
      id: 1,
      projectId: 1,
      claimStatus: 'pending'
    };
    const transferredMilestone = {
      id: 1,
      projectId: 2,
      claimStatus: 'transferred'
    };

    beforeEach(() => {
      dbProject = [];
      dbMilestones = [];
    });

    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        milestoneService: {
          hasAllTransferredMilestones: projectId => {
            const milestoneNotTransferred = dbMilestones.find(
              findedMilestone =>
                findedMilestone.projectId === projectId &&
                findedMilestone.claimStatus !== claimMilestoneStatus.TRANSFERRED
            );
            if (!milestoneNotTransferred) return true;
            return false;
          }
        },
        projectDao: Object.assign(
          {},
          {
            findAllByProps: () =>
              dbProject.filter(
                project => project.status === projectStatuses.EXECUTING
              ),
            updateProject: (toUpdate, id) => {
              const found = dbProject.find(project => project.id === id);
              if (!found) return;
              const updated = { ...found, ...toUpdate };
              dbProject[dbProject.indexOf(found)] = updated;
              return updated;
            }
          }
        )
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it(
      'should change project to Finished status ' +
        'when it has all transferred milestones.',

      async () => {
        dbProject.push(executingToFinished, executingWithNoCompletedMilestones);
        dbMilestones.push(pendingMilestone, transferredMilestone);
        const response = await projectService.transitionFinishedProjects();
        expect(response).toHaveLength(1);
        expect(response).toEqual([
          {
            projectId: executingToFinished.id,
            newStatus: projectStatuses.FINISHED
          }
        ]);
      }
    );
  });

  describe('Get project', () => {
    const ENTREPENEUR_ID = 2;
    const DRAFT_PROJECT_ID = 1;
    const EXECUTING_PROJECT_ID = 2;
    const SECOND_DRAFT_PROJECT_ID = 3;
    const DRAFT_PROJECT = {
      dataComplete: 1,
      proposal: 'proposal',
      faqLink: 'faqLink',
      agreementJson: '{}',
      coverPhotoPath:
        '/files/projects/coverPhotos/8/82ded2f7b23f99fdd6e1d7cd7c6f84c7.jpeg',
      milestonePath: '/milestone',
      proposalFilePath: '/path',
      agreementFileHash: 'hash',
      status: 'draft',
      owner: {},
      createdAt: '2022-10-11T03:00:00.000Z',
      address: 'address',
      funders: [],
      oracles: [],
      followers: [],
      consensusSeconds: 864000,
      fundingSeconds: 864000,
      lastUpdatedStatusAt: '2022-10-11T15:49:35.825Z',
      id: DRAFT_PROJECT_ID,
      txHash: 'hash',
      rejectionReason: 'reason',
      basicInformation: {
        projectName: 'Test project',
        location: 'Argentina',
        timeframe: '232',
        timeframeUnit: 'unit',
        cardPhotoPath:
          '/files/projects/cardPhotos/8/82ded2f7b23f99fdd6e1d7cd7c6f84c7.jpeg'
      },
      details: {
        mission: 'Our mission is to have a mission',
        problemAddressed:
          'We have invented a new problem just to create this project',
        currency: 'usd',
        currencyType: 'fiat',
        budget: '0'
      },
      users: [
        {
          role: '1',
          users: [
            {
              id: 'd2739728-6dcc-4cf6-b0e9-5b8430e7f139',
              firstName: 'Juan',
              lastName: 'Rojas',
              email: 'juan.rojas@globant.com',
              country: 10,
              first: true
            },
            {
              id: '71386471-f95a-4d8b-a14c-fd6207aaaa14',
              firstName: 'Pedro',
              lastName: 'Sanchez',
              sanchezemail: 'pedro.sanchez@globant.com',
              country: 1,
              first: false
            }
          ]
        },
        {
          role: '2',
          users: [
            {
              id: '71386471-f95a-4d8b-a14c-fd6207aaaa14',
              firstName: 'Pedro',
              lastName: 'Sanchez',
              sanchezemail: 'pedro.sanchez@globant.com',
              country: 1,
              first: false
            }
          ]
        },
        {
          role: '3',
          users: [
            {
              id: 'd2739728-6dcc-4cf6-b0e9-5b8430e7f139',
              firstName: 'Juan',
              lastName: 'Rojas',
              email: 'juan.rojas@globant.com',
              country: 10,
              first: true
            }
          ]
        }
      ],
      milestones: [
        {
          id: 1,
          title: 'Title test',
          description: 'Description test',
          budget: '200',
          activities: [
            {
              id: 1,
              title: 'Title',
              description: 'Description',
              acceptanceCriteria: 'Criteria',
              budget: '100',
              currency: 'USD',
              auditor: {
                id: 'd2739728-6dcc-4cf6-b0e9-5b8430e7f139',
                firstName: 'Juan',
                lastName: 'Rojas'
              }
            },
            {
              id: 2,
              title: 'Title',
              description: 'Description',
              acceptanceCriteria: 'Criteria',
              budget: '100',
              currency: 'USD',
              auditor: {
                id: 'd2739728-6dcc-4cf6-b0e9-5b8430e7f139',
                firstName: 'Juan',
                lastName: 'Rojas'
              }
            }
          ]
        },
        {
          id: 2,
          title: 'Title test',
          description: 'Description test',
          budget: '0',
          activities: []
        }
      ],
      parent: null
    };
    const EXECUTING_PROJECT = {
      ...draftProject,
      id: EXECUTING_PROJECT_ID,
      milestones: [
        {
          activities: [
            {
              evidences: [
                {
                  status: 'new'
                }
              ]
            }
          ]
        }
      ],
      status: 'executing'
    };
    const SECOND_DRAFT_PROJECT = {
      ...draftProject,
      id: SECOND_DRAFT_PROJECT_ID
    };
    const projects = [DRAFT_PROJECT, EXECUTING_PROJECT, SECOND_DRAFT_PROJECT];
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        userProjectDao: {
          getProjectsOfUser: () => [
            { project: { id: DRAFT_PROJECT_ID }, userId: ENTREPENEUR_ID },
            { project: { id: EXECUTING_PROJECT_ID }, userId: ENTREPENEUR_ID }
          ]
        },
        projectDao: {
          findById: id => Promise.resolve(projects.find(p => p.id === id)),
          getProjectWithAllData: id =>
            Promise.resolve(projects.find(p => p.id === id)),
          getProjectLastRevisionAndPublished: jest.fn()
        }
      });
    });
    it('should retrieve all data of the project when the user is an admin', async () => {
      await expect(
        projectService.getProject(DRAFT_PROJECT_ID, {
          isAdmin: true,
          id: 1
        })
      ).resolves.toEqual(DRAFT_PROJECT);
    });
    it('should retrieve all data expect sensitive data when the user is regular', async () => {
      await expect(
        projectService.getProject(EXECUTING_PROJECT_ID, {
          isAdmin: false,
          id: ENTREPENEUR_ID
        })
      ).resolves.toEqual(EXECUTING_PROJECT);
    });
    it('should retrieve only public data when ther is no given user', async () => {
      await expect(
        projectService.getProject(EXECUTING_PROJECT_ID)
      ).resolves.toEqual({
        status: EXECUTING_PROJECT.status,
        basicInformation: EXECUTING_PROJECT.basicInformation,
        milestones: [{ activities: [{ evidences: [] }] }]
      });
    });
    it('should retrieve only basic information when the project is in draft and it is logged in', async () => {
      await expect(
        projectService.getProject(DRAFT_PROJECT_ID, {
          role: userRoles.ENTREPRENEUR,
          id: ENTREPENEUR_ID
        })
      ).resolves.toEqual({
        status: projectStatuses.DRAFT,
        basicInformation: DRAFT_PROJECT.basicInformation
      });
    });
    it('should throw when there is no project with given id', async () => {
      const NON_EXISTENT_PROJECT_ID = 9999;
      await expect(
        projectService.getProject(NON_EXISTENT_PROJECT_ID, {
          role: userRoles.ENTREPRENEUR,
          id: ENTREPENEUR_ID
        })
      ).rejects.toEqual(
        new COAError(
          errors.common.CantFindModelWithId('project', NON_EXISTENT_PROJECT_ID)
        )
      );
    });
    it('should throw when user is not related to the project', async () => {
      await expect(
        projectService.getProject(SECOND_DRAFT_PROJECT_ID, {
          role: userRoles.ENTREPRENEUR,
          id: ENTREPENEUR_ID
        })
      ).rejects.toEqual(new COAError(errors.user.UserNotRelatedToTheProject));
    });
  });

  describe('Delete project', () => {
    beforeEach(() => {
      resetDb();
      dbProject.push(draftProjectSecondUpdate, executingProject);
      dbUserProject.push({
        id: 1,
        roleId: 1,
        userId: 1,
        projectId: draftProjectSecondUpdate.id
      });
      dbMilestone.push(milestone);
      dbTask.push(task1, task2, task3);
      dbEvidence.push(evidenceOfTask1, evidenceOfTask2, evidence2OfTask2);
    });
    afterEach(() => jest.clearAllMocks());
    const userProjectDao = {
      getUserProjects: projectId =>
        dbUserProject.filter(up => up.projectId === projectId),
      removeUserProject: userProjectId => {
        dbUserProject = dbUserProject.filter(up => up.id === userProjectId);
      }
    };
    const _projectDao = {
      findById: id => dbProject.find(project => project.id === id),
      deleteProject: ({ projectId }) => {
        dbProject = dbProject.filter(p => p.id === projectId);
        return dbProject.find(p => p.id === projectId);
      }
    };
    const _milestoneDao = {
      deleteMilestone: milestoneId => {
        dbMilestone = dbMilestone.filter(m => m.id === milestoneId);
      }
    };
    const _milestoneService = {
      getAllMilestonesByProject: projectId =>
        dbMilestone.filter(m => m.projectId === projectId)
    };
    const activityDao = {
      deleteActivity: id => {
        dbTask = dbTask.filter(t => t.id === id);
      }
    };
    const taskEvidenceDao = {
      deleteEvidence: id => {
        dbEvidence = dbEvidence.filter(e => e.id === id);
      },
      getEvidencesByTaskId: taskId => dbEvidence.filter(e => e.task === taskId)
    };
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        userProjectDao,
        projectDao: _projectDao,
        milestoneDao: _milestoneDao,
        milestoneService: _milestoneService,
        activityDao,
        taskEvidenceDao
      });
    });
    it(`should successfully delete the project alongside with 
        the user project, activities and milestones`, async () => {
      const projectDaoDeleteSpy = jest.spyOn(_projectDao, 'deleteProject');
      const userProjectDeleteSpy = jest.spyOn(
        userProjectDao,
        'removeUserProject'
      );
      const milestoneDeleteSpy = jest.spyOn(_milestoneDao, 'deleteMilestone');
      const activityDeleteSpy = jest.spyOn(activityDao, 'deleteActivity');
      const evidenceDeleteSpy = jest.spyOn(taskEvidenceDao, 'deleteEvidence');
      await expect(
        projectService.deleteProject(draftProjectSecondUpdate.id)
      ).resolves.toEqual(draftProjectSecondUpdate);
      expect(projectDaoDeleteSpy).toHaveBeenCalledTimes(1);
      expect(milestoneDeleteSpy).toHaveBeenCalledTimes(1);
      expect(userProjectDeleteSpy).toHaveBeenCalledTimes(1);
      expect(activityDeleteSpy).toHaveBeenCalledTimes(3);
      expect(evidenceDeleteSpy).toHaveBeenCalledTimes(3);
    });
    it('should throw when the project is not in draft', async () => {
      await expect(
        projectService.deleteProject(executingProject.id)
      ).rejects.toThrow(
        errors.project.ProjectInvalidStatus(executingProject.id)
      );
    });
    it('should throw when project does not exist', async () => {
      await expect(
        projectService.deleteProject(draftProjectFirstUpdate.id)
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('project', draftProjectFirstUpdate.id)
      );
    });
    it('should throw when there was an error deleting project', async () => {
      jest.spyOn(_projectDao, 'deleteProject').mockReturnValue(undefined);
      await expect(
        projectService.deleteProject(draftProjectSecondUpdate.id)
      ).rejects.toThrow(errors.common.ErrorDeleting('project'));
    });
  });
  describe('Testing cloneProject', () => {
    const _projectDao = {
      findById: id => dbProject.find(p => p.id === id),
      getLastProjectWithValidStatus: projectId =>
        dbProject.find(project => project.id === projectId),
      saveProject: _project => {
        dbProject.push(_project);
        return { id: dbProject.length, ..._project };
      }
    };
    const _milestoneDao = {
      createMilestone: _milestone => {
        dbMilestone.push(_milestone);
        return { id: dbMilestone.length, ..._milestone };
      },
      getMilestonesByProjectId: projectId =>
        dbMilestone.filter(_milestone => _milestone.projectId === projectId)
    };
    const _userProjectDao = {
      getUserProject: ({ project }) =>
        dbUserProject.filter(up => up.projectId === project),
      createUserProject: up => dbUserProject.push(up)
    };
    const _activityDao = {
      createActivity: activity => dbTask.push(activity)
    };
    const _taskEvidenceDao = {
      getEvidencesByTaskId: taskId =>
        dbEvidence.filter(evidence => evidence.task === taskId),
      addTaskEvidence: _evidence => dbEvidence.push(_evidence)
    };
    const _evidenceFileDao = {
      getEvidenceFilesByEvidenceId: evidenceId =>
        dbFileEvidence.filter(_file => _file.evidence === evidenceId),
      saveEvidenceFile: evidenceFile => dbFileEvidence.push(evidenceFile)
    };
    beforeAll(() => {
      restoreProjectService();
      injectMocks(projectService, {
        userProjectDao: _userProjectDao,
        projectDao: _projectDao,
        milestoneDao: _milestoneDao,
        activityDao: _activityDao,
        taskEvidenceDao: _taskEvidenceDao,
        evidenceFileDao: _evidenceFileDao,
        changelogService,
        userProjectService
      });
    });
    beforeEach(() => {
      resetDb();
      dbProject.push(
        draftProjectSecondUpdate,
        executingProject,
        nonGenesisProject,
        openReviewProject
      );
      dbUserProject.push({
        id: 1,
        roleId: 1,
        userId: 1,
        projectId: executingProject.id
      });
      dbMilestone.push(milestone, milestoneOfExecutingProject);
      dbTask.push(task1, task2, task3);
      dbEvidence.push(evidenceOfTask1, evidenceOfTask2, evidence2OfTask2);
      dbFileEvidence.push(fileOfevidenceOfTask1);
    });
    it('should successfully clone the project', async () => {
      const saveProjectSpy = jest.spyOn(_projectDao, 'saveProject');
      const createMilestoneSpy = jest.spyOn(_milestoneDao, 'createMilestone');
      const createActivitySpy = jest.spyOn(_activityDao, 'createActivity');
      const addTaskEvidenceSpy = jest.spyOn(
        _taskEvidenceDao,
        'addTaskEvidence'
      );
      const saveEvidenceFileSpy = jest.spyOn(
        _evidenceFileDao,
        'saveEvidenceFile'
      );
      const createUserProjectSpy = jest.spyOn(
        _userProjectDao,
        'createUserProject'
      );
      const createChangelogSpy = jest.spyOn(
        changelogService,
        'createChangelog'
      );
      await expect(
        projectService.cloneProject({
          userId: 1,
          projectId: executingProject.id
        })
      ).resolves.toEqual({ projectId: dbProject.length + 1 });
      expect(saveProjectSpy).toHaveBeenCalledTimes(1);
      expect(createMilestoneSpy).toHaveBeenCalledTimes(1);
      expect(createActivitySpy).toHaveBeenCalledTimes(3);
      expect(addTaskEvidenceSpy).toHaveBeenCalledTimes(3);
      expect(saveEvidenceFileSpy).toHaveBeenCalledTimes(1);
      expect(createUserProjectSpy).toHaveBeenCalledTimes(1);
      expect(createChangelogSpy).toHaveBeenCalledTimes(1);
    });
    it('should throw when project does not exist', async () => {
      const unexistentProjectId = 99;
      await expect(
        projectService.cloneProject({
          userId: 1,
          projectId: unexistentProjectId
        })
      ).rejects.toThrow(
        errors.common.CantFindModelWithId('project', unexistentProjectId)
      );
    });
    it('should throw when project is not genesis', async () => {
      await expect(
        projectService.cloneProject({
          userId: 1,
          projectId: nonGenesisProject.id
        })
      ).rejects.toThrow(errors.project.ProjectNotGenesis);
    });
    it('should throw when project status is open review', async () => {
      await expect(
        projectService.cloneProject({
          userId: 1,
          projectId: openReviewProject.id
        })
      ).rejects.toThrow(
        errors.project.ProjectInvalidStatus(openReviewProject.id)
      );
    });
  });
});
