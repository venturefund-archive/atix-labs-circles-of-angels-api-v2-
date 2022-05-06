/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const ethServicesMock = () => ({
  createProject: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  isTransactionConfirmed: creationTransactionHash => !!creationTransactionHash,
  startProject: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  createMilestone: () => true,
  createActivity: () => true,
  validateActivity: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  claimMilestone: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  setMilestoneFunded: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  uploadHashEvidenceToActivity: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  createAccount: () => ({
    address: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
    privateKey:
      '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200'
  }),
  transferInitialFundsToAccount: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
});

module.exports = ethServicesMock;
