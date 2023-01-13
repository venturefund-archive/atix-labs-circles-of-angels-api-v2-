/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async findById(milestoneId) {
    const milestone = await this.model.findOne({
      id: milestoneId,
      deleted: false
    });
    return milestone;
  },
  async getMilestoneByIdWithProject(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId, deleted: false })
      .populate('project');

    return milestone;
  },
  async getMilestonesByProjectId(project) {
    const milestones = await this.model
      .find({ project, deleted: false })
      .populate('tasks', { sort: 'id ASC' })
      .sort('id ASC');
    return milestones || [];
  },
  async saveMilestone({ milestone, projectId }) {
    const toSave = {
      ...milestone,
      project: projectId
    };
    const createdMilestone = await this.model.create(toSave);
    return createdMilestone;
  },
  async createMilestone(milestone) {
    const createdMilestone = await this.model.create(milestone);
    return createdMilestone;
  },
  async updateMilestone(milestone, milestoneId) {
    const toUpdate = { ...milestone };

    const savedMilestone = await this.model
      .updateOne({ id: milestoneId, deleted: false })
      .set({ ...toUpdate });

    return savedMilestone;
  },
  async deleteMilestone(milestoneId) {
    const deleted = await this.model
      .updateOne({ id: milestoneId })
      .set({ deleted: true });
    return deleted;
  },

  async getMilestoneTasks(milestoneId) {
    const milestone = await this.model
      .findOne({ id: milestoneId, deleted: false })
      .populate('tasks');

    if (!milestone) return;
    return milestone.tasks || [];
  },
  async updateMilestoneStatus(milestoneId, status) {
    this.model.update(milestoneId).set({ status });
  },
  async getMilestones(filters) {
    const milestones = await this.model
      .find()
      .where(filters)
      .populate('project')
      .populate('tasks')
      .sort('createdAt DESC');

    return milestones || [];
  },
  async updateCreationTransactionHash(milestoneId, transactionHash) {
    this.model.updateOne({ id: milestoneId }).set({ transactionHash });
  },

  async removeMilestonesByProps(filter) {
    const deletedMilestones = await this.model.destroy(filter).fetch();
    return deletedMilestones.map(oracle => oracle.id);
  },
  async getMilestonesByProject(project) {
    return this.model.find({ project, deleted: false });
  }
};
