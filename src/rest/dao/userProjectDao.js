/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const findUserProjectById = userProjectModel => async userProjectId => {
  const userProject = await userProjectModel.findOne({ id: userProjectId });
  return userProject;
};

const findUserProject = userProjectModel => async ({ userId, projectId }) => {
  const userProject = await userProjectModel.findOne({
    user: userId,
    project: projectId
  });
  return userProject;
};

const updateStatus = userProjectModel => async ({ userProject, newStatus }) => {
  const updatedUserProject = await userProjectModel
    .update({ id: userProject.id })
    .set({ status: newStatus });

  return updatedUserProject;
};

const getUserProjects = userProjectModel => async projectId => {
  const userProjects = await userProjectModel
    .find({ project: projectId })
    .populate('user');

  return userProjects;
};

const createUserProject = userProjectModel => async userProject =>
  userProjectModel.create(userProject);

const getProjectsOfUser = userProjectModel => async userId =>
  userProjectModel.find({ user: userId }).populate('project');

module.exports = userProjectModel => ({
  findUserProject: findUserProject(userProjectModel),
  updateStatus: updateStatus(userProjectModel),
  getUserProjects: getUserProjects(userProjectModel),
  createUserProject: createUserProject(userProjectModel),
  getProjectsOfUser: getProjectsOfUser(userProjectModel),
  findUserProjectById: findUserProjectById(userProjectModel)
});
