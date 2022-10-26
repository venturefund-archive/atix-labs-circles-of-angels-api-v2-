/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const uuid = require('uuid');
const { userRoles } = require('../util/constants');

module.exports = {
  async findById(id) {
    const user = await this.model.findOne({ id }).populate('wallets', {
      where: { active: true }
    });
    if (!user) {
      return;
    }
    if (!user.wallets.length) {
      return { withNoWallets: true, ...user };
    }
    const { address, encryptedWallet, mnemonic, iv } = user.wallets[0];
    delete user.address;
    delete user.encryptedWallet;
    delete user.wallets;
    delete user.mnemonic;
    return { address, encryptedWallet, mnemonic, iv, ...user };
  },

  async getUserByEmail(email) {
    const user = await this.model
      .findOne({ email, blocked: false })
      .populate('roles')
      .populate('wallets', {
        where: { active: true }
      });
    if (!user) {
      return;
    }
    if (!user.wallets.length) {
      return { withNoWallets: true, ...user };
    }
    const { address, encryptedWallet, mnemonic, iv } = user.wallets[0];
    delete user.address;
    delete user.encryptedWallet;
    delete user.wallets;
    delete user.mnemonic;
    return { address, encryptedWallet, mnemonic, iv, ...user };
  },

  async createUser(user) {
    return this.model.create({
      id: uuid.v4(),
      ...user
    });
  },

  async getFollowedProjects(id) {
    return this.model.findOne({ id }).populate('following');
  },

  async getAppliedProjects(id) {
    return this.model
      .findOne({ id })
      .populate('funding')
      .populate('monitoring');
  },

  async updateUser(id, user) {
    const updatedUser = await this.model.updateOne({ id }).set({ ...user });
    return updatedUser;
  },

  async updateUserByEmail(email, user) {
    const updatedUser = await this.model
      .updateOne({ where: { email: email.toLowerCase() } })
      .set({ ...user });
    return updatedUser;
  },

  async updatePasswordByMail(email, pwd) {
    return this.model
      .updateOne({ where: { email: email.toLowerCase() } })
      .set({ pwd });
  },

  /* eslint-disable no-param-reassign */
  async getUsers() {
    const users = await this.model
      .find({
        where: {
          blocked: false
        }
      })
      .populate('roles')
      .populate('wallets', {
        where: { active: true }
      });
    return users.map(user => {
      if (!user.wallets.length) {
        return user;
      }
      const { address, encryptedWallet, mnemonic, iv } = user.wallets[0];
      delete user.address;
      delete user.encryptedWallet;
      delete user.wallets;
      delete user.mnemonic;
      return { address, encryptedWallet, mnemonic, iv, ...user };
    });
  },

  async updateTransferBlockchainStatus(userId, status) {
    return this.model
      .updateOne({ id: userId })
      .set({ transferBlockchainStatus: status });
  },

  async removeUserById(id) {
    return this.model.destroy({ id });
  },

  async getUsersByProject(projectId) {
    return this.model.find({ blocked: false }).populate('roles', {
      where: { project: projectId }
    });
  }
};
