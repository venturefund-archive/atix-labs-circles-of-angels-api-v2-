/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const findByRoleId = questionModel => async roleId =>
  questionModel.find({ role: roleId });

module.exports = questionModel => ({
  findByRoleId: findByRoleId(questionModel)
});
