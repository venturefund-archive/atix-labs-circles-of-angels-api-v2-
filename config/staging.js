/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const cronExpressions = require('../src/rest/services/cronjob/cronExpressions');

module.exports = {
  server: {
    isHttps: true,
    domain: 'frontend.staging.coa.atixlabs.xyz'
  },
  crons: {
    disableAll: false,
    transitionProjectStatusJob: {
      cronTime: cronExpressions.EVERY_FIVE_MINUTES,
      disabled: false,
      runOnInit: false,
      timezone: undefined
    },
    checkContractBalancesJob: {
      cronTime: cronExpressions.EVERY_HOUR,
      disabled: false,
      runOnInit: false,
      timezone: undefined
    }
  },
  defaultProjectTimes: {
    minimumUnit: 'seconds',
    consensusSeconds: 300,
    fundingSeconds: 300
  },
  buidler: {
    defaultNetwork: 'testnet'
  },
  gsnConfig: {
    isEnabled: true,
    relayHubAddress: '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979'
  },
  contractAddresses: {
    Project_v0: ['0xBa2071DDF40549AE8aA861F61DEe90F124b0b8DC'],
    SuperDAO_v0: ['0xe5F354D8E41f62fc7E32a3E5F45F32Ebc6FcD8F7'],
    DAO_v0: ['0x7d0029dc5001323dc4fF4422556B52e4a56Dab26'],
    ProxyAdmin: ['0x44fD102013e634829d00153bBB161983210b4706'],
    ClaimsRegistry_v0: ['0xBC29A4d403b6BA26c31Db00db06fac64c636Bbae'],
    COA_v0: ['0x85D0fd533C1c561817ae24044e5EfC304C0298F0'],
    UsersWhitelist: ['0x620d43ee5e9728ad7BEd57de5e81DB573bCb5b37'],
    ClaimsRegistry: ['0xBC29A4d403b6BA26c31Db00db06fac64c636Bbae'],
    SuperDAO: ['0x577cE740B9fD9dbA0057d48691E019B13d6C885d'],
    DAO: ['0x43828Ee03620F3Fd65dffF88b896D29464614789'],
    COA: ['0x85D0fd533C1c561817ae24044e5EfC304C0298F0']
  }
};
