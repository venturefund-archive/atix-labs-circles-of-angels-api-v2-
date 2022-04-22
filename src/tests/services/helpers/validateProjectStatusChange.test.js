const validateProjectStatusChange = require('../../../rest/services/helpers/validateProjectStatusChange');
const validators = require('../../../rest/services/helpers/projectStatusValidators/validators');
const COAError = require('../../../rest/errors/COAError');
const errors = require('../../../rest/errors/exporter/ErrorExporter');

const { projectStatuses, userRoles } = require('../../../rest/util/constants');

const entrepreneurUser = {
  id: 2,
  firstName: 'Social',
  lastName: 'Entrepreneur',
  role: userRoles.ENTREPRENEUR,
  email: 'seuser@email.com',
  address: '0x02222222'
};

const newProject = {
  id: 1,
  projectName: 'New Project',
  location: 'Location',
  timeframe: '12 months',
  goalAmount: 5000,
  owner: entrepreneurUser.id,
  cardPhotoPath: 'cardPhotoPath.jpg',
  coverPhotoPath: 'coverPhotoPath.jpg',
  problemAddressed: 'Problem',
  proposal: 'Proposal',
  mission: 'Mission',
  status: projectStatuses.NEW
};

describe('Testing validateProjectStatusChange', () => {
  beforeAll(() => {
    Object.keys(validators).forEach(validator => {
      validators[validator] = jest.fn();
    });
  });
  it.each([
    [projectStatuses.NEW, projectStatuses.TO_REVIEW],
    [projectStatuses.NEW, projectStatuses.DELETED],
    [projectStatuses.TO_REVIEW, projectStatuses.PUBLISHED],
    [projectStatuses.TO_REVIEW, projectStatuses.REJECTED],
    [projectStatuses.REJECTED, projectStatuses.TO_REVIEW],
    [projectStatuses.REJECTED, projectStatuses.DELETED],
    [projectStatuses.PUBLISHED, projectStatuses.CONSENSUS],
    [projectStatuses.CONSENSUS, projectStatuses.FUNDING],
    [projectStatuses.CONSENSUS, projectStatuses.REJECTED],
    [projectStatuses.FUNDING, projectStatuses.EXECUTING],
    [projectStatuses.EXECUTING, projectStatuses.ABORTED],
    [projectStatuses.EXECUTING, projectStatuses.CHANGING_SCOPE],
    [projectStatuses.EXECUTING, projectStatuses.FINISHED],
    [projectStatuses.CHANGING_SCOPE, projectStatuses.EXECUTING],
    [projectStatuses.CHANGING_SCOPE, projectStatuses.ABORTED],
    [projectStatuses.ABORTED, projectStatuses.ARCHIVED],
    [projectStatuses.FINISHED, projectStatuses.ARCHIVED]
  ])(
    'should resolve and return the new status when chaging from %s to %s',
    async (from, to) => {
      await expect(
        validateProjectStatusChange({
          user: entrepreneurUser,
          newStatus: to,
          project: { ...newProject, status: from }
        })
      ).resolves.toBe(to);
    }
  );
  it('should throw an error if required params are missing', async () => {
    await expect(
      validateProjectStatusChange({
        user: entrepreneurUser,
        project: newProject
      })
    ).rejects.toThrow(
      errors.common.RequiredParamsMissing('validateProjectStatusChange')
    );
  });
  it('should throw an error if the transition does not exist', async () => {
    await expect(
      validateProjectStatusChange({
        user: entrepreneurUser,
        newStatus: projectStatuses.FINISHED,
        project: newProject
      })
    ).rejects.toThrow(errors.project.InvalidProjectTransition);
  });
  it('should throw an error if the transition validator fails', async () => {
    validators.fromNew.mockImplementation(() => {
      throw new COAError(errors.project.IsNotCompleted);
    });
    await expect(
      validateProjectStatusChange({
        user: entrepreneurUser,
        newStatus: projectStatuses.TO_REVIEW,
        project: newProject
      })
    ).rejects.toThrow(errors.project.IsNotCompleted);
  });
});
