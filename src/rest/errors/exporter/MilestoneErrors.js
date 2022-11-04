module.exports = {
  CantUpdateMilestone: milestoneId => ({
    message: `Cant update milestone with id ${milestoneId}`
  }),
  MilestoneDoesNotBelongToProject: {
    message: 'Milestone does not belong to project'
  },
  CantProcessMilestonesFile: {
    message: 'The milestone file cannot be processed'
  },
  ErrorProcessingMilestonesFile: {
    message: 'An error occurred while processing the milestones file'
  },
  ErrorCreatingMilestonesFromFile: {
    message: 'Error creating milestones from file'
  },
  ProjectNotFound: milestoneId => ({
    message: `Project of milestone id ${milestoneId} not found`,
    statusCode: 404
  }),
  CreateWithInvalidProjectStatus: status => ({
    message: `Can't create new milestone in project with status ${status}`,
    statusCode: 403
  }),
  UpdateWithInvalidProjectStatus: status => ({
    message: `Milestone of project with status ${status} can't be updated`,
    statusCode: 403
  }),
  DeleteWithInvalidProjectStatus: status => ({
    message: `Milestone of project with status ${status} can't be deleted`,
    statusCode: 403
  }),
  InvalidStatusForClaimMilestone: status => ({
    message: `Can't claim milestone when milestone is in ${status} status`,
    statusCode: 400
  }),
  InvalidStatusForClaimableMilestone: status => ({
    message: `Can't set milestone as claimable when claim status is ${status}`,
    statusCode: 400
  }),
  CantDeleteActivity: {
    message: 'Cant delete activity',
    statusCode: 500
  }
};
