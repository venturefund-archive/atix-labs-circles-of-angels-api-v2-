/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { blockchainStatus } = require('../util/constants');

module.exports = {
  async saveActivity(activity, milestoneId) {
    const toSave = {
      ...activity,
      milestone: milestoneId
    };
    const createdActivity = await this.model.create(toSave);
    return createdActivity;
  },

  async createActivity(activity) {
    const createdActivity = await this.model.create(activity);
    return createdActivity;
  },

  async findById(id) {
    const activity = await this.model.findOne({ id, deleted: false });
    return activity;
  },

  async updateActivity(activity, activityId) {
    const toUpdate = { ...activity };

    const savedActivity = await this.model
      .updateOne({ id: activityId, deleted: false })
      .set({ ...toUpdate });

    return savedActivity;
  },

  async deleteActivity(activityId) {
    const deleted = await this.model
      .updateOne({ id: activityId, deleted: false })
      .set({ deleted: true });
    return deleted;
  },

  async updateTransactionHash(activityId, transactionHash) {
    return this.model
      .updateOne({ id: activityId, deleted: false })
      .set({ transactionHash });
  },

  async whichUnconfirmedActivities(activitiesIds) {
    return this.model.find({
      where: {
        id: activitiesIds,
        blockchainStatus: { '!=': blockchainStatus.CONFIRMED },
        deleted: false
      }
    });
  },

  async updateCreationTransactionHash(activityId, transactionHash) {
    return this.model
      .updateOne({ id: activityId, deleted: false })
      .set({ transactionHash });
  },

  async getTaskByIdWithMilestone(id) {
    const task = await this.model
      .findOne({ id, deleted: false })
      .populate('milestone');
    return task;
  },

  getTaskByMilestones(milestoneIds) {
    return this.model.find({
      where: { milestone: { in: milestoneIds }, deleted: false }
    });
  },

  getActivitiesByMilestones(milestoneIds) {
    return this.model.find({ milestone: { in: milestoneIds }, deleted: false });
  },

  getTasksByMilestone(milestoneId) {
    return this.model
      .find({
        where: { milestone: milestoneId, deleted: false }
      })
      .sort('id ASC')
      .populate('auditor');
  }
};
