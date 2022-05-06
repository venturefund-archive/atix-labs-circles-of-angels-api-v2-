const { injectMocks } = require('../../rest/util/injection');
const { projectStatuses, userRoles } = require('../../rest/util/constants');
const projectExperienceService = require('../../rest/services/projectExperienceService');
const files = require('../../rest/util/files');

const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');

describe('Project experience service', () => {
  let dbProject = [];
  let dbProjectExperience = [];
  let dbProjectExperiencePhoto = [];
  let dbUser = [];
  const resetDb = () => {
    dbUser = [];
    dbProject = [];
    dbProjectExperience = [];
    dbProjectExperiencePhoto = [];
  };

  const mockedPhotoPath = '/path/of/photo';
  const validPhoto = { name: 'photo.jpeg', size: 12312 };
  const invalidMtypePhoto = { name: 'invalid.json', size: 1233 };
  const invalidSizePhoto = { name: 'photo.jpeg', size: 1231231231 };
  const comment = 'This is a comment';

  const entrepreneurUser = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const consensusProject = {
    id: 1,
    owner: entrepreneurUser.id,
    status: projectStatuses.CONSENSUS
  };
  const finishedProject = {
    id: 1,
    status: projectStatuses.FINISHED
  };

  const consensusProjectExperiences = [
    {
      id: 1,
      project: consensusProject.id,
      user: entrepreneurUser.id,
      comment
    },
    {
      id: 2,
      project: consensusProject.id,
      user: entrepreneurUser.id,
      comment
    }
  ];

  const consensusProjectExperiencePhotos = [
    {
      id: 1,
      path: mockedPhotoPath,
      projectExperience: 1
    },
    {
      id: 2,
      path: mockedPhotoPath,
      projectExperience: 2
    },
    {
      id: 3,
      path: mockedPhotoPath,
      projectExperience: 1
    }
  ];

  const projectService = {
    getProjectById: id => {
      const found = dbProject.find(project => project.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('project', id));
      return found;
    }
  };
  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    }
  };
  const projectExperienceDao = {
    saveProjectExperience: experience => {
      const newExperience = {
        ...experience,
        id: dbProjectExperience.length + 1
      };
      dbProjectExperience.push(newExperience);
      return newExperience;
    },
    getExperiencesByProjectId: projectId => {
      const experiences = dbProjectExperience.filter(
        experience => experience.project === projectId
      );
      const populated = experiences.map(experience => {
        const expUser = dbUser.find(user => user.id === experience.user);
        const expPhotos = dbProjectExperiencePhoto.filter(
          photo => photo.projectExperience === experience.id
        );
        return {
          ...experience,
          user: expUser || null,
          photos: expPhotos || []
        };
      });
      return populated;
    }
  };
  const projectExperiencePhotoDao = {
    saveProjectExperiencePhoto: experiencePhoto => {
      const newExperiencePhoto = {
        ...experiencePhoto,
        id: dbProjectExperiencePhoto.length + 1
      };
      dbProjectExperiencePhoto.push(newExperiencePhoto);
      return newExperiencePhoto;
    }
  };

  beforeAll(() => {
    files.saveFile = jest.fn(() => mockedPhotoPath);
    injectMocks(projectExperienceService, {
      projectService,
      userService,
      projectExperienceDao,
      projectExperiencePhotoDao
    });
  });
  beforeEach(() => resetDb());

  describe('Validate photos', () => {
    it('Should not throw an error whenever valid photos are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([
          validPhoto,
          validPhoto,
          validPhoto
        ])
      ).not.toThrow();
    });
    it('Should throw an error whenever valid photos and a photo with invalid size are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([invalidSizePhoto, validPhoto])
      ).toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
    it('Should throw an error whenever valid photos and a photo with invalid type are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([invalidMtypePhoto, validPhoto])
      ).toThrow(errors.file.ImgFileTyPeNotValid);
    });
  });
  describe('Can upload', () => {
    // TODO: test all cases when defined
    it.each([
      [consensusProject, entrepreneurUser],
      [finishedProject, entrepreneurUser]
    ])(
      'should return true when the project is %o and user is %o',
      (project, user) => {
        expect(projectExperienceService.canUpload(project, user)).toBe(true);
      }
    );
    it('should throw an error when the project status is not valid', () => {
      expect(() =>
        projectExperienceService.canUpload({ status: projectStatuses.NEW })
      ).toThrow(
        errors.project.InvalidStatusForExperienceUpload(projectStatuses.NEW)
      );
    });
  });
  describe('Save photos', () => {
    it('Should return an array with the paths of the files recently saved', async () => {
      const photoPaths = await projectExperienceService.savePhotos([
        validPhoto,
        validPhoto
      ]);
      expect(photoPaths).toHaveLength(2);
      expect(photoPaths).toEqual([mockedPhotoPath, mockedPhotoPath]);
    });
    it(
      'Should return an array with the paths of all successfully saved photos ' +
        'filtering the failed ones',
      async () => {
        files.saveFile.mockImplementationOnce(() => Promise.reject());
        const photoPaths = await projectExperienceService.savePhotos([
          validPhoto,
          validPhoto
        ]);
        expect(photoPaths).toHaveLength(1);
        expect(photoPaths).toEqual([mockedPhotoPath]);
      }
    );
    it('Should return an empty array if all files failed to be saved', async () => {
      files.saveFile
        .mockImplementationOnce(() => Promise.reject())
        .mockImplementationOnce(() => Promise.reject());
      const photoPaths = await projectExperienceService.savePhotos([
        validPhoto,
        validPhoto
      ]);
      expect(photoPaths).toHaveLength(0);
    });
  });
  describe('Add experience', () => {
    beforeEach(() => {
      dbProject.push(consensusProject);
      dbUser.push(entrepreneurUser);
    });
    it('Should create the project experience whenever the project exists and all fields are valid', async () => {
      const response = await projectExperienceService.addExperience({
        comment,
        projectId: consensusProject.id,
        userId: entrepreneurUser.id,
        photos: [validPhoto, validPhoto]
      });
      expect(response).toEqual({
        projectExperienceId: dbProjectExperience.length
      });
      const lastExperienceCreated = dbProjectExperience.find(
        experience => experience.id === dbProjectExperience.length
      );
      expect(lastExperienceCreated).toEqual({
        id: response.projectExperienceId,
        comment,
        project: consensusProject.id,
        user: entrepreneurUser.id
      });
      const experiencePhotosCreated = dbProjectExperiencePhoto.filter(
        experiencePhoto =>
          experiencePhoto.projectExperience === response.projectExperienceId
      );
      expect(experiencePhotosCreated).toHaveLength(2);
    });
    it('Should throw an error when some needed field are missing', async () => {
      await expect(
        projectExperienceService.addExperience({
          comment,
          projectId: consensusProject.id,
          userId: entrepreneurUser.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('addExperience'));
    });
    it('Should throw an error when the project exists but some photo has an invalid size', async () => {
      await expect(
        projectExperienceService.addExperience({
          comment,
          projectId: consensusProject.id,
          userId: entrepreneurUser.id,
          photos: [invalidSizePhoto]
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
    it('Should throw an error when the project exists but some photo has an invalid type', async () => {
      await expect(
        projectExperienceService.addExperience({
          comment,
          projectId: consensusProject.id,
          userId: entrepreneurUser.id,
          photos: [invalidMtypePhoto]
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });
    it('Should throw an error when the project does not exist', async () => {
      await expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 0,
          userId: entrepreneurUser.id,
          photos: [validPhoto]
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
    it('Should throw an error when the user does not exist', async () => {
      await expect(
        projectExperienceService.addExperience({
          comment,
          projectId: consensusProject.id,
          userId: 0,
          photos: [validPhoto]
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('user', 0));
    });
  });
  describe('Get project experiences', () => {
    beforeEach(() => {
      dbUser.push(entrepreneurUser);
      dbProject.push(consensusProject);
      dbProjectExperience.push(...consensusProjectExperiences);
      dbProjectExperiencePhoto.push(...consensusProjectExperiencePhotos);
    });
    it('Should return an array with all the project experiences of an existent project', async () => {
      const response = await projectExperienceService.getProjectExperiences({
        projectId: consensusProject.id
      });
      expect(response).toHaveLength(2);

      response.forEach(experience => {
        expect(experience.photos).not.toHaveLength(0);
        expect(experience.project).toEqual(consensusProject.id);
        expect(experience.user).toEqual(expect.anything());
        expect(experience.comment).toEqual(expect.any(String));
      });
    });
    it('Should return an empty array when the project exist but has no experiences', async () => {
      dbProjectExperience = [];
      dbProjectExperiencePhoto = [];
      const response = await projectExperienceService.getProjectExperiences({
        projectId: consensusProject.id
      });
      expect(response).toHaveLength(0);
    });
    it('Should throw an error when required param is missing', async () => {
      await expect(
        projectExperienceService.getProjectExperiences({})
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getProjectExperiences')
      );
    });
    it('Should throw an error when the project does not exist', async () => {
      await expect(
        projectExperienceService.getProjectExperiences({ projectId: 0 })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
  });
});
