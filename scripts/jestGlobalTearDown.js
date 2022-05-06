const { exec } = require('child_process');
const { testConfig } = require('config');
const { stopGSN } = require('./stopDevGsn');
const logger = require('../src/rest/logger');

async function stopNode() {
  // Kill the proccess that is running in the ganache port
  exec(
    `pid=$(lsof -t -i :${
      testConfig.ganache.port
    } -s TCP:LISTEN) && kill -9 $pid >> /dev/null`
  );
}

module.exports = async () => {
  logger.info('Running jest global teardown');
  if (testConfig.relayer.runOnTest) {
    await stopGSN();
  }
  if (testConfig.ganache.runOnTest) {
    await stopNode();
  }
  logger.info('Jest global teardown finished');
};
