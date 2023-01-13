const { exec } = require('child_process');
const { testConfig } = require('config');
const { stopGSN } = require('./stopDevGsn');
const logger = require('../src/rest/logger');

async function stopNode() {
  // Kill the proccess that is running in the hardhat's node port
  exec(
    `pid=$(lsof -t -i :${
      testConfig.hardhatNode.port
    } -s TCP:LISTEN) && kill -9 $pid >> /dev/null`
  );
}

module.exports = async () => {
  logger.info('Running jest global teardown');
  if (testConfig.relayer.runOnTest) {
    await stopGSN();
  }
  if (testConfig.hardhatNode.runOnTest) {
    await stopNode();
  }
  logger.info('Jest global teardown finished');
};
