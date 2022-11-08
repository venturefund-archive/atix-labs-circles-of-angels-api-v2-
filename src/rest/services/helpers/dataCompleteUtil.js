const logger = require('../../logger');

const updateDataComplete = ({ dataComplete, step, value }) => {
  logger.info('[updateDataComplete] :: Entering updateDataComplete method');
  const dataCompletBinary = dataComplete.toString(2);
  const dataCompleteArray = dataCompletBinary.padStart(4, '0').split('');
  const stepIndex = dataCompleteArray.length - step;
  const dataCompleteArrayUpdated = dataCompleteArray.map((item, index) =>
    index !== stepIndex ? item : value
  );
  const dataCompleteBinaryUpdated = dataCompleteArrayUpdated.join('');
  return parseInt(dataCompleteBinaryUpdated, 2);
};

module.exports = {
  completeStep: ({ dataComplete, step }) =>
    updateDataComplete({ dataComplete, step, value: '1' }),
  removeStep: ({ dataComplete, step }) =>
    updateDataComplete({ dataComplete, step, value: '0' })
};
