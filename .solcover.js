const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov", "cobertura"],
  onIstanbulComplete: async function (_config) {
    // We need to do this because solcover generates bespoke artifacts.
    shell.rm("-rf", "./artifacts");
  },
  providerOptions: {},
  skipFiles: ["mocks", "test"],
};
