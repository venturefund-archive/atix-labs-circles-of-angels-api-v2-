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
    domain: 'frontend.uat.coa.atixlabs.xyz'
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
  hardhat: {
    defaultNetwork: 'testnet'
  },
  gsnConfig: {
    isEnabled: true,
    relayHubAddress: '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979'
  },
  contractAddresses: {
    Project: ['0x420476619173B4a3fBf68D595E4463084Cf68fa3'],
    SuperDAO: ['0xd9FEC1D3235c455CEA7925C233E068B77805Bf5B'],
    DAO: ['0x659423d72F3d6057c57a07974673D5fFe69E2B95'],
    ProxyAdmin: ['0x9a06426bccfa22fE1958bf9923b48C890FA0E9d1'],
    ClaimsRegistry: ['0x93870E888e4742b767b46e305E5fD4C201F9E970'],
    COA: ['0x86039e987cb82CA44f0035D0C7C99fef4b7Ed879']
  }
};
