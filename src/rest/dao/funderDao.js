/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async addCandidate({ project, user }) {
    const followerCreated = await this.model.create({ project, user });
    return followerCreated;
  },

  async deleteFundersByProject(projectId, filters) {
    return this.model.destroyOne({
      project: projectId,
      ...filters
    });
  }
};
