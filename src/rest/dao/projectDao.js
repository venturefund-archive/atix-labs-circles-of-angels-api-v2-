/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const { BigNumber } = require('bignumber.js');
const { isEmpty } = require('lodash');
const moment = require('moment');
const uuid = require('uuid');
const { forEachPromise } = require('../util/promises');
const {
  projectStatus,
  projectStatuses,
  projectStatusesWithUpdateTime,
  decimalBase,
  ACTIVITY_STATUS,
  ACTIVITY_TYPES
} = require('../util/constants');
const transferDao = require('./transferDao');
const userDao = require('./userDao');
const activityDao = require('./activityDao');
const activityService = require('../services/activityService');
const taskEvidenceDao = require('./taskEvidenceDao');
const userProjectService = require('../services/userProjectService');
const roleDao = require('./roleDao');

const calculateTotalCurrent = (activities, type) =>
  activities
    .filter(activity => activity.type === type)
    .reduce(
      (accum, activity) => accum.plus(BigNumber(activity.current)),
      BigNumber('0')
    );

const buildProjectWithBasicInformation = async project => {
  const {
    projectName,
    location,
    timeframe,
    timeframeUnit,
    cardPhotoPath,
    goalAmount,
    ...rest
  } = project;

  const basicInformation = {
    projectName,
    location,
    timeframe,
    timeframeUnit,
    thumbnailPhoto: cardPhotoPath,
    beneficiary: await userProjectService.getBeneficiaryByProjectId({
      projectId: project.id
    })
  };
  return { ...rest, budget: goalAmount, basicInformation };
};

const buildProjectWithUsers = async project => {
  const usersByProject = await userDao.getUsersByProject(project.id);
  const dbRoles = await roleDao.getAllRoles();
  const rolesWithUser = usersByProject
    .map(({ id, firstName, lastName, email, country, first, roles, wallets }) =>
      roles.map(({ role }) => ({
        id,
        firstName,
        lastName,
        email,
        country,
        first,
        role,
        address: wallets.length > 0 ? wallets[0].address : undefined
      }))
    )
    .flat();

  const usersByRole = rolesWithUser.reduce(
    (mapUserByRole, { role, ...user }) => ({
      ...mapUserByRole,
      [role]: mapUserByRole[role] ? [...mapUserByRole[role], user] : [user]
    }),
    {}
  );
  const users = Object.entries(usersByRole).flatMap(
    ([role, usersWithRole]) => ({
      role,
      users: usersWithRole
    })
  );
  const usersWithRoleDescription = users.map(user => ({
    roleDescription: dbRoles.find(
      r => r.id === Number.parseInt(user.role, decimalBase)
    ).description,
    ...user
  }));
  const toReturn = { ...project, users: usersWithRoleDescription };
  return toReturn;
};

const buildProjectWithMilestonesAndActivitiesAndDetails = async project => {
  const {
    mission,
    problemAddressed,
    currency,
    currencyType,
    additionalCurrencyInformation,
    agreementFilePath,
    proposalFilePath,
    ...rest
  } = project;

  const milestonesWithActivities = await Promise.all(
    project.milestones.map(async ({ id, title, description, status }) => {
      const activitiesByMilestone = await activityDao.getTasksByMilestone(id);
      const activities = activitiesByMilestone.map(
        ({
          id: activityId,
          title: activityTitle,
          description: activityDescription,
          acceptanceCriteria,
          budget,
          deposited,
          spent,
          auditor: { id: auditorId, firstName, lastName },
          status: activityStatus,
          type,
          current
        }) => ({
          id: activityId,
          title: activityTitle,
          description: activityDescription,
          acceptanceCriteria,
          budget,
          deposited,
          spent,
          currency,
          auditor: { id: auditorId, firstName, lastName },
          status: activityStatus,
          type,
          current
        })
      );

      const funding = activityService.getActivitiesBudgetAndCurrentByType({
        activities,
        type: ACTIVITY_TYPES.FUNDING
      });

      const spending = activityService.getActivitiesBudgetAndCurrentByType({
        activities,
        type: ACTIVITY_TYPES.SPENDING
      });

      const payback = activityService.getActivitiesBudgetAndCurrentByType({
        activities,
        type: ACTIVITY_TYPES.PAYBACK
      });

      const milestone = {
        id,
        title,
        description,
        funding,
        spending,
        payback,
        status,
        activities
      };
      return milestone;
    })
  );

  const totalActivities = milestonesWithActivities.flatMap(
    milestone => milestone.activities
  );
  const completedActivities = totalActivities.filter(
    activity => activity.status === ACTIVITY_STATUS.APPROVED
  );
  const fundingActivities = totalActivities.filter(
    activity => activity.type === ACTIVITY_TYPES.FUNDING
  );
  const totalBudget = fundingActivities.reduce(
    (accum, activity) => accum.plus(BigNumber(activity.budget)),
    BigNumber('0')
  );
  const totalFunding = calculateTotalCurrent(
    completedActivities,
    ACTIVITY_TYPES.FUNDING
  );
  const totalSpending = calculateTotalCurrent(
    completedActivities,
    ACTIVITY_TYPES.SPENDING
  );
  const totalPayback = calculateTotalCurrent(
    completedActivities,
    ACTIVITY_TYPES.PAYBACK
  );

  const completedMilestonesLength = milestonesWithActivities.filter(milestone =>
    milestone.activities.every(act => act.status === ACTIVITY_STATUS.APPROVED)
  ).length;

  const status = {
    milestones: {
      completed: completedMilestonesLength,
      incompleted: milestonesWithActivities.length - completedMilestonesLength
    },
    activities: {
      completed: completedActivities.length,
      incompleted: totalActivities.length - completedActivities.length
    },
    budget: totalBudget,
    funding: totalFunding,
    spending: totalSpending,
    payback: totalPayback
  };

  const details = {
    mission,
    problemAddressed,
    currency,
    currencyType,
    additionalCurrencyInformation,
    legalAgreementFile: agreementFilePath,
    projectProposalFile: proposalFilePath,
    status
  };

  const projectWithMilestonesAndDetails = {
    ...rest,
    details,
    milestones: milestonesWithActivities
  };
  return projectWithMilestonesAndDetails;
};

const buildProjectWithEvidences = async project => {
  const milestonesWithEvidences = await Promise.all(
    project.milestones.map(async milestone => ({
      ...milestone,
      activities: await Promise.all(
        milestone.activities.map(async activity => {
          const evidences = await taskEvidenceDao.getEvidencesByTaskId(
            activity.id
          );
          const activityWithEvidences = { ...activity, evidences };
          return activityWithEvidences;
        })
      )
    }))
  );
  const projectWithEvidences = {
    ...project,
    milestones: milestonesWithEvidences
  };
  return projectWithEvidences;
};

const mapFieldAndSum = ({ array, field }) =>
  array
    .map(activity => activity[field])
    .reduce((partialSum, amount) => partialSum.plus(amount), BigNumber(0));

module.exports = {
  async saveProject(project) {
    const createdProject = await this.model.create({
      ...project,
      id: uuid.v4()
    });
    return createdProject;
  },

  async findAllByProps(filters, populate) {
    const projects = await this.model.find(filters, populate);
    return projects.map(project => ({
      ...project,
      nextStatusUpdateAt: this.getNextStatusUpdate(project)
    }));
  },

  async findOneByProps(filters, populate) {
    return this.model.findOne(filters, populate);
  },

  async findProjectWithUsersById(id) {
    return this.model.findOne(
      { id },
      { owner: true, followers: true, funders: true, oracles: true }
    );
  },

  async getProjecListWithStatusFrom({ status }) {
    const projects = await this.model.find({
      where: { status: { '>=': status } },
      sort: 'id DESC'
    });
    await forEachPromise(projects, project =>
      this.addUserInfoOnProject(project)
    );
    return projects;
  },

  async updateProjectStatus({ projectId, status }) {
    const response = this.model.updateOne({ id: projectId }).set({ status });
    return response;
  },

  async getProjectById({ projectId }) {
    const project = await this.model.findOne({ id: projectId });

    if (!project || project == null) {
      return project;
    }
    return this.addUserInfoOnProject(project);
  },

  async findById(id) {
    const project = await this.model.findOne({ id });
    if (!isEmpty(project)) {
      return {
        ...project,
        nextStatusUpdateAt: this.getNextStatusUpdate(project)
      };
    }
  },

  /* eslint no-param-reassign: ["error", { "props": false }] */
  async addUserInfoOnProject(project) {
    const user = await userDao.findById(project.ownerId);
    if (!user) return project;
    project.ownerName = user.username;
    project.ownerEmail = user.email;
    return project;
  },

  async deleteProject({ projectId }) {
    const deletedProject = this.model.destroy({ id: projectId }).fetch();
    return deletedProject;
  },

  async getProjectMilestones({ projectId }) {
    const projectMilestones = await this.model
      .findOne({ id: projectId })
      .populate('milestones');
    return projectMilestones ? projectMilestones.milestones : [];
  },

  async getProjectMilestonesFilePath(projectId) {
    return this.model.findOne({
      where: { id: projectId },
      select: ['milestonePath']
    });
  },

  async updateProjectAgreement({ projectAgreement, projectId }) {
    const updated = this.model
      .update({ id: projectId })
      .set({ projectAgreement });
    return updated;
  },

  async updateProject(project, id) {
    const toUpdate = { ...project };

    delete toUpdate.id;
    delete toUpdate.ownerId;

    const savedProject = await this.model
      .updateOne({ id })
      .set({ ...toUpdate });

    return savedProject;
  },

  async getProjectPhotos(projectId) {
    return this.model.findOne({
      where: { id: projectId },
      select: ['coverPhoto', 'cardPhoto']
    });
  },

  async getUserOwnerOfProject(projectId) {
    try {
      const project = await this.getProjectById({ projectId });
      const owner = await userDao.findById(project.ownerId);
      return owner;
    } catch (error) {
      throw Error('Error getting User');
    }
  },

  async getProjectsByOwner(ownerId) {
    return this.model.find({
      ownerId,
      status: { '>=': projectStatus.PUBLISHED }
    });
  },

  async getAllProjectsById(projectsId) {
    return this.model.find({
      id: projectsId,
      status: { '>=': projectStatus.PUBLISHED }
    });
  },

  getNextStatusUpdate({
    status,
    lastUpdatedStatusAt,
    consensusSeconds,
    fundingSeconds
  }) {
    let secondsToAdd;
    if (status === projectStatusesWithUpdateTime.CONSENSUS) {
      secondsToAdd = consensusSeconds;
    } else if (status === projectStatusesWithUpdateTime.FUNDING) {
      secondsToAdd = fundingSeconds;
    } else {
      return null;
    }

    return moment(lastUpdatedStatusAt)
      .add(secondsToAdd, 'seconds')
      .toISOString();
  },

  async findProjectsWithTransfers() {
    try {
      const projectIds = await transferDao.findProjectIdsWithTransfers();
      return this.model.find({ where: { id: { in: projectIds } } });
    } catch (error) {
      throw Error('Error getting projects');
    }
  },

  async getProjectWithAllData(id) {
    const project = await this.model
      .findOne({ id })
      .populate('milestones', {
        where: {
          deleted: false
        },
        sort: 'id ASC'
      })
      .populate('funders')
      .populate('oracles')
      .populate('proposer')
      .populate('followers');
    if (!project) return project;
    return this.buildProjectWithEditingFields(
      await buildProjectWithEvidences(
        await buildProjectWithMilestonesAndActivitiesAndDetails(
          await buildProjectWithUsers(
            await buildProjectWithBasicInformation(project)
          )
        )
      )
    );
  },

  async getLastProjectWithValidStatus(id) {
    const project = await this.model
      .find({
        or: [{ id }, { parent: id }],
        status: {
          nin: [
            projectStatuses.OPEN_REVIEW,
            projectStatuses.IN_REVIEW,
            projectStatuses.CANCELLED_REVIEW
          ]
        }
      })
      .sort('revision DESC')
      .limit(1);
    return project[0];
  },

  async getLastPublicRevisionProject(id) {
    const project = await this.model
      .find()
      .where({
        or: [{ id }, { parent: id }],
        status: {
          nin: [
            projectStatuses.OPEN_REVIEW,
            projectStatuses.IN_REVIEW,
            projectStatuses.CANCELLED_REVIEW
          ]
        }
      })
      .populate('milestones', {
        where: {
          deleted: false
        },
        sort: 'id ASC'
      })
      .populate('proposer')
      .sort('revision DESC')
      .limit(1);
    if (!project) return project;
    return this.buildProjectWithEditingFields(
      await buildProjectWithEvidences(
        await buildProjectWithMilestonesAndActivitiesAndDetails(
          await buildProjectWithUsers(
            await buildProjectWithBasicInformation(project[0])
          )
        )
      )
    );
  },

  async findActiveProjectClone(id) {
    return this.model.findOne().where({
      parent: id,
      status: [projectStatuses.OPEN_REVIEW, projectStatuses.IN_REVIEW]
    });
  },

  async buildProjectWithEditingFields(project) {
    const projectId = project.parent || project.id;
    const activeProjectClone = await this.findActiveProjectClone(projectId);
    const editing = !!activeProjectClone;
    const cloneId = activeProjectClone ? activeProjectClone.id : null;
    const inReview = activeProjectClone?.status === projectStatuses.IN_REVIEW;
    const projectWithEditingFields = {
      ...project,
      editing,
      cloneId,
      inReview
    };
    return projectWithEditingFields;
  },

  async findGenesisProjects() {
    const projects = await this.model.find({
      where: { parent: null },
      sort: 'id DESC'
    });
    return projects;
  },

  async findInReviewProjects() {
    const projects = await this.model.find({
      status: {
        in: [projectStatuses.IN_REVIEW]
      }
    });
    return projects;
  },

  async getLastValidReview(id) {
    const project = await this.model
      .find({
        or: [{ id }, { parent: id }],
        status: {
          nin: [projectStatuses.CANCELLED_REVIEW, projectStatuses.OPEN_REVIEW]
        }
      })
      .sort('revision DESC')
      .limit(1);

    return project[0];
  },

  async getProjectWithProposer(id) {
    return this.model.findOne({ id }).populate('proposer');
  }
};
