/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const ProjectStatusDao = ({ projectStatusModel }) => ({
  async existStatus({ status }) {
    const exists = (await projectStatusModel.count({ status })) > 0;
    return exists;
  },

  async getProjectStatusByName(name) {
    const projectStatus = await projectStatusModel.findOne({ name });
    return projectStatus;
  }
});

module.exports = ProjectStatusDao;
