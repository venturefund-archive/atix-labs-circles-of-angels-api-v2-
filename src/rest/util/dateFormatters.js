const moment = require('moment');

const SECONDS_IN_A_DAY = 86400;
const MS_IN_A_SECOND = 1000;

module.exports = {
  secondsToDays: seconds => Math.round(seconds / SECONDS_IN_A_DAY),
  getStartOfDay: date => moment(date).startOf('day'),
  getDaysPassed: (from, to) => moment(to).diff(from, 'days'),
  getSecondsPassed: (from, to) =>
    Math.ceil(moment(to).diff(from, 'milliseconds') / MS_IN_A_SECOND)
};
