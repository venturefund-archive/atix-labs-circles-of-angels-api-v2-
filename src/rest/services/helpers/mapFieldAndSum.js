const { BigNumber } = require('bignumber.js');

module.exports = ({ array, field }) =>
  array
    .map(object => object[field])
    .reduce((partialSum, amount) => partialSum.plus(amount), BigNumber(0));
