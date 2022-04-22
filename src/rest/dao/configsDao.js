/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const coaAccountAddressKey = 'coa_bank_account_address';
const coaAccountBankKey = 'coa_bank_account_bank_name';
const coaAccountOwnerKey = 'coa_bank_account_owner_name';

const ConfigsDao = ({ configsModel }) => ({
  async getCoaBankAccount() {
    const response = {};
    response.address = (await configsModel.findByKey({
      key: coaAccountAddressKey
    })).value;
    response.bank = (await configsModel.findByKey({
      key: coaAccountBankKey
    })).value;
    response.owner = (await configsModel.findByKey({
      key: coaAccountOwnerKey
    })).value;
    return response;
  }
});

module.exports = ConfigsDao;
