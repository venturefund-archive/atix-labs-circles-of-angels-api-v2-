/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

require('dotenv').config();

module.exports = {
  server: {
    host: process.env.HOST
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://www.circlesofangels.org:3000'
};
