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

  async findById(id) {
    const activity = await this.model.findOne({ id });
    return activity;
  },

  async updateActivity(activity, activityId) {
    const toUpdate = { ...activity };

    const savedActivity = await this.model
      .updateOne({ id: activityId })
      .set({ ...toUpdate });

    return savedActivity;
  },

  async deleteActivity(activityId) {
    const deleted = this.model.destroyOne(activityId);
    return deleted;
  },

  async updateTransactionHash(activityId, transactionHash) {
    return this.model.updateOne({ id: activityId }).set({ transactionHash });
  },

  async whichUnconfirmedActivities(activitiesIds) {
    return this.model.find({
      where: {
        id: activitiesIds,
        blockchainStatus: { '!=': blockchainStatus.CONFIRMED }
      }
    });
  },

  async updateCreationTransactionHash(activityId, transactionHash) {
    return this.model.updateOne({ id: activityId }).set({ transactionHash });
  },

  async getTaskByIdWithMilestone(id) {
    const task = await this.model.findOne({ id }).populate('milestone');
    return task;
  },

  getTaskByMilestones(milestoneIds) {
    return this.model.find({
      where: { milestone: { in: milestoneIds } }
    });
  }
};
