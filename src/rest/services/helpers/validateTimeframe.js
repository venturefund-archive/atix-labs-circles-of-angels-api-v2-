const COAError = require('../../errors/COAError');
const errors = require('../../errors/exporter/ErrorExporter');
const logger = require('../../logger');

module.exports = timeframe => {
  if (timeframe <= 0) {
    logger.info(
      '[validateTimeframe] :: Timeframe cannot be less than or equal to 0'
    );
    throw new COAError(errors.project.InvalidTimeframe());
  }
};
