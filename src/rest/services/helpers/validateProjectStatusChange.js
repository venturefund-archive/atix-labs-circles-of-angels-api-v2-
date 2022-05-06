const errors = require('../../errors/exporter/ErrorExporter');
const COAError = require('../../errors/COAError');
const validators = require('./projectStatusValidators/validators');
const validateRequiredParams = require('../helpers/validateRequiredParams');

const logger = require('../../logger');

const { projectStatuses } = require('../../util/constants');

const {
  NEW,
  TO_REVIEW,
  REJECTED,
  DELETED,
  PUBLISHED,
  CONSENSUS,
  FUNDING,
  EXECUTING,
  CHANGING_SCOPE,
  FINISHED,
  ABORTED,
  ARCHIVED,
  CANCELLED
} = projectStatuses;

const allowedTransitions = {
  [NEW]: [
    {
      validator: args => validators.fromNew(args),
      nextSteps: [TO_REVIEW, DELETED]
    }
  ],
  [TO_REVIEW]: [
    {
      validator: args => validators.fromToReview(args),
      // TODO: consensus may need to be removed eventually
      nextSteps: [PUBLISHED, CONSENSUS, REJECTED]
    }
  ],
  [REJECTED]: [
    {
      validator: args => validators.fromRejected(args),
      nextSteps: [TO_REVIEW, DELETED]
    }
  ],
  [DELETED]: [
    {
      nextSteps: []
    }
  ],
  [PUBLISHED]: [
    {
      validator: args => validators.fromPublished(args),
      nextSteps: [CONSENSUS]
    }
  ],
  [CONSENSUS]: [
    {
      validator: args => validators.fromConsensus(args),
      nextSteps: [FUNDING, REJECTED]
    }
  ],
  [FUNDING]: [
    {
      validator: args => validators.fromFunding(args),
      nextSteps: [EXECUTING, CONSENSUS]
    }
  ],
  [EXECUTING]: [
    {
      validator: args => validators.fromExecuting(args),
      nextSteps: [ABORTED, CHANGING_SCOPE, FINISHED]
    }
  ],
  [CHANGING_SCOPE]: [
    {
      validator: args => validators.fromChangingScope(args),
      nextSteps: [EXECUTING, ABORTED]
    }
  ],
  [ABORTED]: [
    {
      validator: args => validators.fromAborted(args),
      nextSteps: [ARCHIVED]
    }
  ],
  [FINISHED]: [
    {
      validator: args => validators.fromFinished(args),
      nextSteps: [ARCHIVED]
    }
  ],
  [CANCELLED]: [
    {
      nextSteps: []
    }
  ]
};

/**
 * Validates if a project can be changed to the provided status.
 * Returns the new status.
 *
 * @param {*} user user requesting the change
 * @param {number} projectId project to update
 * @param {string} newStatus new project status
 */
module.exports = async ({ user, newStatus, project }) => {
  validateRequiredParams({
    method: 'validateProjectStatusChange',
    params: { user, newStatus, project }
  });
  const [transition] = allowedTransitions[project.status].filter(
    ({ nextSteps }) => nextSteps.includes(newStatus)
  );
  if (!transition || !transition.validator) {
    logger.error(
      `[Project Service] :: Project status transition from ${
        project.status
      } to ${newStatus} is not valid`
    );
    throw new COAError(errors.project.InvalidProjectTransition);
  }
  await transition.validator({ user, newStatus, project });
  return newStatus;
};
