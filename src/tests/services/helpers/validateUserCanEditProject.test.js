const validateUserCanEditProject = require('../../../rest/services/helpers/validateUserCanEditProject');
const { projectStatuses } = require('../../../rest/util/constants');
const originalUserService = require('../../../rest/services/userProjectService');

describe('Testing validateUserCanEditProject', () => {
  const draftProject = {
    id: 1,
    status: projectStatuses.DRAFT
  };
  const inProgressProject = {
    id: 2,
    status: projectStatuses.IN_PROGRESS
  };
  const openReviewProject = {
    id: 3,
    status: projectStatuses.OPEN_REVIEW
  };
  const adminUser = {
    id: 1,
    isAdmin: true
  };
  const regularUser = {
    id: 2,
    isAdmin: false
  };
  const customError = status => new Error(status);

  it('should pass when its admin and proper project status ', async () => {
    jest
      .spyOn(originalUserService, 'getUserProjectFromRoleDescription')
      .mockReturnValue({});
    await expect(
      validateUserCanEditProject({
        project: draftProject,
        user: adminUser,
        error: customError
      })
    ).resolves.not.toThrow();
  });

  it('should pass when its regular user and proper project status ', async () => {
    jest
      .spyOn(originalUserService, 'getUserProjectFromRoleDescription')
      .mockReturnValue({});
    await expect(
      validateUserCanEditProject({
        project: openReviewProject,
        user: regularUser,
        error: customError
      })
    ).resolves.not.toThrow();
  });

  it('should throw when its regular user and invalid project status ', async () => {
    await expect(
      validateUserCanEditProject({
        project: inProgressProject,
        user: regularUser,
        error: customError
      })
    ).rejects.toThrow(customError(inProgressProject.status));
  });

  it('should throw when its admin and invalid project status ', async () => {
    await expect(
      validateUserCanEditProject({
        project: inProgressProject,
        user: adminUser,
        error: customError
      })
    ).rejects.toThrow(customError(inProgressProject.status));
  });
});
