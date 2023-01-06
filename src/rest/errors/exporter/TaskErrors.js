module.exports = {
  UpdateWithInvalidProjectStatus: status => ({
    message: `Activity of project with status ${status} can't be updated`,
    statusCode: 403
  }),
  UserIsNotAuditorInProject: (userId, projectId) => ({
    message: `User with id ${userId} can't be assigned as an auditor because they doesn't have the role in the project with id ${projectId}`,
    statusCode: 403
  }),
  ProjectNotFound: taskId => ({
    message: `Project of task id ${taskId} not found`,
    statusCode: 400
  }),
  MilestoneNotFound: activityId => ({
    message: `Milestone of activity id ${activityId} not found`,
    statusCode: 400
  }),
  OracleNotAssigned: ({ userId, taskId }) => ({
    message: `User ${userId} is not the oracle assigned for task ${taskId}`,
    statusCode: 403
  }),
  DeleteWithInvalidProjectStatus: status => ({
    message: `Task of project with status ${status} can't be deleted`,
    statusCode: 403
  }),
  CreateWithInvalidProjectStatus: status => ({
    message: `Can't create new activity in project with status ${status}`,
    statusCode: 403
  }),
  AssignOracleWithInvalidProjectStatus: status => ({
    message: `Can't assign an oracle to a task in a project with status ${status}`,
    statusCode: 403
  }),
  NotOracleCandidate: {
    message: 'The user has not applied as an oracle for the project',
    statusCode: 403
  },
  OracleAddressNotFound: taskId => ({
    message: `Address of oracle assigned for task ${taskId} not found`,
    statusCode: 400
  }),
  EvidenceBlockchainInfoNotFound: evidenceId => ({
    message: `Evidence ${evidenceId} doesn't have blockchain information`,
    statusCode: 400
  }),
  EvidenceStatusNotValid: status => ({
    message: `Evidence status '${status}' is not a valid value`,
    statusCode: 400
  }),
  EvidenceStatusCannotChange: status => ({
    message: `Status ${status} of an evidence cannot be updated`,
    statusCode: 400
  }),
  GSNAccountNotConfigured: () => ({
    message: 'GSN Account Not Configured!',
    statusCode: 400
  }),
  UserCanNotAddEvidenceToProject: ({ userId, activityId, projectId }) => ({
    message: `User ${userId} can't add evidence to activity ${activityId} because it is not the beneficiary or founder of project ${projectId}`,
    statusCode: 403
  }),
  InvalidEvidenceType: type => ({
    message: `The evidence type ${type} is invalid`,
    statusCode: 400
  }),
  UserCantUpdateEvidence: {
    message: 'User does not have the rights to update the evidence',
    statusCode: 400
  },
  EvidenceUpdateError: {
    message: 'Evidence couldnt be updated',
    statusCode: 500
  },
  ActivityStatusCantBeUpdated: {
    message: 'There was an error updating activity status',
    statusCode: 500
  },
  MissingTransactionId: {
    message: 'Transaction Id is missing',
    statusCode: 400
  },
  InvalidStatusTransition: {
    message: 'Status transition is invalid',
    statusCode: 400
  },
  InvalidStatus: status => ({
    message: `Status ${status} is invalid`,
    statusCode: 400
  }),
  InvalidRequiredStatus: {
    message: 'Required activity status was not meet',
    statusCode: 400
  },
  TxActivityCreateError: {
    message: 'Error creating transaction activity',
    statusCode: 500
  },
  UserIsNotActivityAuditor: {
    message: 'User is not auditor of this activity',
    statusCode: 400
  },
  TaskNotReady: {
    message: 'All of the evidences need to be rejected or approved',
    statusCode: 400
  },
  ActivityIsApprovedOrInProgress: status => ({
    message: `Cant add evidence to an activity with ${status} status`,
    statusCode: 400
  }),
  TransactionIsNotRelatedToProjectAddress: {
    message: 'Transaction is not related with project address',
    statusCode: 400
  },
  CantDeleteTaskWithStatus: status => ({
    message: `Cant delete activity with status ${status}`,
    statusCode: 500
  }),
  CantUpdateTaskWithStatus: status => ({
    message: `Cant update activity with status ${status}`,
    statusCode: 500
  }),
  OnlyProposerCanSendProposeClaimTransaction: {
    message:
      'Cant send the transaction because the user is not the proposer of the activity',
    statusCode: 400
  }
};
