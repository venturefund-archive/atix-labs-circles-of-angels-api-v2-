/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async createRecovery(email, token, expirationDate) {
    const recover = await this.model.find({ email });
    if (recover) await this.model.destroyOne({ email });
    return this.model.create({ email, token, expirationDate });
  },
  async findRecoverBytoken(token) {
    const found = await this.model.findOne({ where: { token } });
    return found;
  },
  async deleteRecoverByToken(token) {
    await this.model.destroyOne({ where: { token } });
  }
};
