const logger = require('../../logger');

module.exports = ({ dataComplete, stepCompleted }) => {
  logger.info(
    '[generateNewDataComplete] :: Entering generateNewDataComplete method'
  );
  const dataCompletBinary = dataComplete.toString(2);
  const dataCompleteArray = dataCompletBinary.padStart(4, '0').split('');
  const stepIndex = dataCompleteArray.length - stepCompleted;
  const dataCompleteArrayUpdated = dataCompleteArray.map((item, index) =>
    index !== stepIndex ? item : '1'
  );
  const dataCompleteBinaryUpdated = dataCompleteArrayUpdated.join('');
  return parseInt(dataCompleteBinaryUpdated, 2);
};
