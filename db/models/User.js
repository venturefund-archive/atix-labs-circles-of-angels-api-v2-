/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represent a user of Circles Of Angels, this can be:
 *              Social Entrepreneur, Project Supporter, Project Curator,
 *              Bank operator, COA Administrator
 * @attribute `id`: user id in the business domain
 * @attribute `name`: name with which the user will be shown
 * @attribute `email`: email with which the user is registered
 * @attribute `pwd`: password with which the user logs
 * @attribute `roles`: role / roles that the user has in the tool
 *            (this can be for example Funder and Oracle at the same time)
 */
const { omit } = require('lodash');
const { userRoles } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'user',
  primaryKey: 'id',
  attributes: {
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    id: { type: 'string', required: true },
    role: {
      type: 'string',
      validations: { isIn: Object.values(userRoles) },
      required: true
    },
    blocked: { type: 'boolean', defaultsTo: false, required: false },
    projects: {
      collection: 'project',
      via: 'owner'
    },
    funding: {
      collection: 'project',
      via: 'user',
      through: 'project_funder'
    },
    following: {
      collection: 'project',
      via: 'user',
      through: 'project_follower'
    },
    monitoring: {
      collection: 'project',
      via: 'user',
      through: 'project_oracle'
    },
    country: {
      columnName: 'countryId',
      model: 'country'
    },
    wallets: {
      collection: 'user_wallet',
      via: 'user'
    },
    phoneNumber: { type: 'string', allowNull: true },
    answers: { type: 'string', required: true },
    company: { type: 'string', required: false, allowNull: true },
    forcePasswordChange: {
      type: 'boolean',
      defaultsTo: false,
      required: false
    },
    emailConfirmation: { type: 'boolean', defaultsTo: false, required: false },
    // Remove once the prod users reovery them passwords
    address: { type: 'string', required: false, allowNull: true },
    encryptedWallet: { type: 'json', required: false },
    mnemonic: { type: 'string', required: false, allowNull: true },
    roles: {
      collection: 'user_project',
      via: 'user'
    },
    isAdmin: { type: 'boolean', required: true, allowNull: false }
  },
  customToJSON: function toJson() {
    return omit(this, ['password']);
  },
  async findById(id) {
    return this.findOne(id);
  }
};
