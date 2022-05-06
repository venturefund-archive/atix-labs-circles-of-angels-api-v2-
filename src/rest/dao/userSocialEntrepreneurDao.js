/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const create = userSocialEntrepreneurModel => async userFunder =>
  userSocialEntrepreneurModel.create(userFunder);

const getById = userSocialEntrepreneurModel => async id => {
  const userSocialEntrepreneur = userSocialEntrepreneurModel.findOne({
    id
  });
  return userSocialEntrepreneur;
};

const getByUserId = userSocialEntrepreneurModel => async userId => {
  const userSocialEntrepreneur = userSocialEntrepreneurModel.findOne({
    user: userId
  });
  return userSocialEntrepreneur;
};

module.exports = userSocialEntrepreneurModel => ({
  create: create(userSocialEntrepreneurModel),
  getById: getById(userSocialEntrepreneurModel),
  getByUserId: getByUserId(userSocialEntrepreneurModel)
});
