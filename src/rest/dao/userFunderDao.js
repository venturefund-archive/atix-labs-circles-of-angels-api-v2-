/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const create = userFunderModel => async userFunder =>
  userFunderModel.create(userFunder);

const getById = userFunderModel => async id => {
  const userFunder = userFunderModel.findOne({
    id
  });
  return userFunder;
};

const getByUserId = userFunderModel => async userId => {
  const userFunder = userFunderModel.findOne({
    user: userId
  });
  return userFunder;
};

module.exports = userFunderModel => ({
  create: create(userFunderModel),
  getById: getById(userFunderModel),
  getByUserId: getByUserId(userFunderModel)
});
