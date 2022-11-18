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
const { forEachPromise } = require('../util/promises');
const {
  projectStatus,
  projectStatusesWithUpdateTime,
  rolesTypes
} = require('../util/constants');
const transferDao = require('./transferDao');
const userDao = require('./userDao');
const activityDao = require('./activityDao');
const roleDao = require('./roleDao');
const userProjectDao = require('./userProjectDao');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');

const getBeneficiaryByProjectId = async projectId => {
  let beneficiary;

  const beneficiaryRole = await roleDao.getRoleByDescription(
    rolesTypes.BENEFICIARY
  );
  if (!beneficiaryRole) throw COAError(errors.common.ErrorGetting('role'));
  const beneficiaryUserProject = await userProjectDao.findUserProjectWithUser({
    project: projectId,
    role: beneficiaryRole.id
  });

  if (beneficiaryUserProject) {
    beneficiary = {
      id: beneficiaryUserProject.user.id,
      lastName: beneficiaryUserProject.user.lastName,
      firstName: beneficiaryUserProject.user.firstName
    };
  }

  return beneficiary;
};

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
    beneficiary: await getBeneficiaryByProjectId(project.id)
  };
  return { ...rest, budget: goalAmount, basicInformation };
};

const buildProjectWithDetails = project => {
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
  const details = {
    mission,
    problemAddressed,
    currency,
    currencyType,
    additionalCurrencyInformation,
    legalAgreementFile: agreementFilePath,
    projectProposalFile: proposalFilePath
  };
  return { ...rest, details };
};

const buildProjectWithUsers = async project => {
  const usersByProject = await userDao.getUsersByProject(project.id);

  const rolesWithUser = usersByProject
    .map(({ id, firstName, lastName, email, country, first, roles }) =>
      roles.map(({ role }) => ({
        id,
        firstName,
        lastName,
        email,
        country,
        first,
        role
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
  return { ...project, users };
};

const buildProjectWithMilestonesAndActivities = async project => {
  const milestonesWithActivities = await Promise.all(
    project.milestones.map(async ({ id, title, description }) => {
      const activitiesByMilestone = await activityDao.getTasksByMilestone(id);
      const activities = activitiesByMilestone.map(
        ({
          id: activityId,
          title: activityTitle,
          description: activityDescription,
          acceptanceCriteria,
          budget,
          auditor: { id: auditorId, firstName, lastName }
        }) => ({
          id: activityId,
          title: activityTitle,
          description: activityDescription,
          acceptanceCriteria,
          budget,
          currency: project.details.currency,
          auditor: { id: auditorId, firstName, lastName }
        })
      );

      const milestoneBudget = activities
        .map(({ budget }) => budget)
        .reduce(
          (partialBudgetSum, budget) => partialBudgetSum.plus(budget),
          BigNumber(0)
        );
      const milestone = {
        id,
        title,
        description,
        budget: milestoneBudget,
        activities
      };
      return milestone;
    })
  );
  const projectWithMilestones = {
    ...project,
    milestones: milestonesWithActivities
  };
  return projectWithMilestones;
};

module.exports = {
  async saveProject(project) {
    const createdProject = await this.model.create(project);
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
      .populate('milestones')
      .populate('funders')
      .populate('oracles')
      .populate('owner')
      .populate('followers');
    if (!project) return project;
    return buildProjectWithMilestonesAndActivities(
      await buildProjectWithUsers(
        buildProjectWithDetails(await buildProjectWithBasicInformation(project))
      )
    );
  }
};
