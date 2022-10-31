/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async getRoleById(id) {
    const role = await this.model.findOne({
      id
    });
    return role;
  },
  async getAllRoles() {
    const roleList = await this.model.find();
    return roleList || [];
  },
  async getRoleByDescription(description) {
    return this.model.findOne({
      where: {
        description
      }
    });
  }
};
