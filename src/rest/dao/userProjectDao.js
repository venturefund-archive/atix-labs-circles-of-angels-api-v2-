/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async findUserProject({ userId, projectId }) {
    const userProject = await this.model.findOne({
      user: userId,
      project: projectId
    });
    return userProject;
  },
  async updateStatus({ userProject, newStatus }) {
    const updatedUserProject = await this.model
      .update({ id: userProject.id })
      .set({ status: newStatus });

    return updatedUserProject;
  },
  async getUserProjects(projectId) {
    const userProjects = await this.model
      .find({ project: projectId })
      .populate('user');
    return userProjects;
  },
  async createUserProject(userProject) {
    return this.model.create(userProject);
  },
  async getProjectsOfUser(userId) {
    return this.model.find({ user: userId }).populate('project');
  },
  async findUserProjectById(userProjectId) {
    const userProject = await this.model.findOne({ id: userProjectId });
    return userProject;
  }
};
