/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
module.exports = {
  async getFileById(id) {
    const file = await this.model.findOne({ id });
    return file;
  },

  async saveFile(file) {
    const savedFile = await this.model.create(file);
    return savedFile;
  },

  async deleteFile(fileId) {
    const deletedFile = await this.model.destroyOne({ id: fileId });
    return deletedFile;
  }
};
