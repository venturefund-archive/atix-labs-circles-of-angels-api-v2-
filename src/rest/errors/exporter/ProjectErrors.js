module.exports = {
  CreateProjectFieldsNotValid: {
    message: 'The create project fields are not valid',
    statusCode: 400
  },
  CantSaveProject: {
    message: 'Cant save project'
  },
  ProjectIsNotPublishable: {
    message: 'The project is not publishable, it has an invalid status',
    statusCode: 400
  },
  CantUpdateProject: projectId => ({
    message: `Cant update project with id ${projectId}`
  }),
  CantApplyToProject: status => ({
    message: `It is not allowed to apply to a project when it is in ${status} status`,
    statusCode: 400
  }),
  CantFollowProject: projectId => ({
    message: `Project ${projectId} hasn't been published yet`,
    statusCode: 400
  }),
  MilestoneFileHasBeenAlreadyUploaded: {
    message: 'Milestone file has been already uploaded',
    statusCode: 400
  },
  InvalidStatusForMilestoneFileProcess: status => ({
    message: `Cant process milestone file when project is in ${status} status`,
    statusCode: 400
  }),
  ProjectNotApproved: {
    message: 'Project has not been approved yet',
    statusCode: 400
  },
  ProjectDoesntHaveMilestonesFile: projectId => ({
    message: `Project ${projectId} doesn't have milestones file`,
    statusCode: 400
  }),
  MilestonesFileNotFound: (projectId, filepath) => ({
    message: `Milestones file wasn't found for project ${projectId} and path ${filepath}`,
    statusCode: 400
  }),
  InvalidProjectTransition: {
    message: 'Project status transition is not valid',
    statusCode: 400
  },
  ProjectCantBeUpdated: status => ({
    message: `Project with status ${status} can't be updated`,
    statusCode: 400
  }),
  AlreadyProjectFollower: () => ({
    message: 'User already follow this project',
    statusCode: 400
  }),
  AlreadyApplyToProject: role => ({
    message: `User already apply to ${role} in this project`,
    statusCode: 400
  }),
  IsNotFollower: () => ({
    message: 'User is not following this project',
    statusCode: 400
  }),
  IsNotCompleted: {
    message: 'Project is not completed',
    statusCode: 400
  },
  ChangingStatus: {
    message: 'An error occurred while changing the project status',
    statusCode: 400
  },
  InvalidStatusForExperienceUpload: status => ({
    message: `Can't upload experiences when project is in ${status} status`,
    statusCode: 400
  }),
  InvalidStatusForGetFundAmount: status => ({
    message: `Can't get total fund amount when project is in ${status} status`,
    statusCode: 400
  }),
  InvalidStatusForEvidenceUpload: status => ({
    message: `Can't upload evidence when project is in ${status} status`,
    statusCode: 400
  }),
  InvalidStatusForClaimMilestone: status => ({
    message: `Can't claim milestone when project is in ${status} status`,
    statusCode: 400
  }),
  InvalidStatusForClaimableMilestone: status => ({
    message: `Can't set milestone as claimable when project status is ${status}`,
    statusCode: 400
  }),
  MilestonesNotFound: projectId => ({
    message: `Milestones not found for project ${projectId}`,
    statusCode: 400
  }),
  NotAllOraclesAssigned: projectId => ({
    message: `Project ${projectId} doesn't have all tasks with an oracle assigned`,
    statusCode: 400
  }),
  NoFunderCandidates: projectId => ({
    message: `Project ${projectId} doesn't have funder candidates`,
    statusCode: 400
  }),
  TransfersNotFound: projectId => ({
    message: `Project ${projectId} doesn't have any transfers done`,
    statusCode: 400
  }),
  MinimumFundingNotReached: projectId => ({
    message: `Minimum funding amount required for project ${projectId} has not been reached`,
    statusCode: 400
  }),
  AddressNotFound: projectId => ({
    message: `Project of id ${projectId} doesn't have an address`,
    statusCode: 400
  }),
  BlockchainInfoNotFound: projectId => ({
    message: `Project ${projectId} doesn't have blockchain information`,
    statusCode: 400
  }),
  BlockchainWritingError: projectId => ({
    message: `Error when updating blockchain information for Project ${projectId}`,
    statusCode: 400
  }),
  RejectionReasonEmpty: projectId => ({
    message: `RejectionReason is required to update project with id ${projectId} to rejected`,
    statusCode: 400
  })
};
