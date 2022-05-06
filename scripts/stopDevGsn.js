const { exec } = require('child_process');
const { testConfig } = require('config');

async function stopGSN() {
  // Kill the proccess that is running on the relayer port
  exec(
    `pid=$(lsof -t -i :${
      testConfig.relayer.port
    } -s TCP:LISTEN) && kill -9 $pid >> /dev/null`
  );
}

module.exports = {
  stopGSN
};
