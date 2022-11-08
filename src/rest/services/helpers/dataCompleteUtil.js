const logger = require('../../logger');

const BINARY_BASE = 2;
const BINARY_PLACES = 4;

const updateDataComplete = ({ dataComplete, step, value }) => {
  logger.info('[updateDataComplete] :: Entering updateDataComplete method');
  const dataCompletBinary = dataComplete.toString(BINARY_BASE);
  const dataCompleteArray = dataCompletBinary
    .padStart(BINARY_PLACES, '0')
    .split('');
  const stepIndex = dataCompleteArray.length - step;
  console.log(stepIndex);
  console.log(dataCompleteArray);
  const dataCompleteArrayUpdated = dataCompleteArray.map((item, index) =>
    index !== stepIndex ? item : value
  );
  const dataCompleteBinaryUpdated = dataCompleteArrayUpdated.join('');
  return parseInt(dataCompleteBinaryUpdated, BINARY_BASE);
};

module.exports = {
  completeStep: ({ dataComplete, step }) =>
    updateDataComplete({ dataComplete, step, value: '1' }),
  removeStep: ({ dataComplete, step }) =>
    updateDataComplete({ dataComplete, step, value: '0' })
};
