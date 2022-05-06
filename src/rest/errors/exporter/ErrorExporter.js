const common = require('./CommonErrors');
const file = require('./FileErrors');
const task = require('./TaskErrors');
const milestone = require('./MilestoneErrors');
const project = require('./ProjectErrors');
const transfer = require('./TransferErrors');
const user = require('./UserErrors');
const dao = require('./DaoErrors');
const server = require('./ServerErrors');
const mail = require('./MailErrors');
const transaction = require('./TransactionErrors');
const userWallet = require('./UserWalletErrors');

module.exports = {
  common,
  file,
  task,
  milestone,
  project,
  transfer,
  user,
  dao,
  server,
  mail,
  transaction,
  userWallet
};
