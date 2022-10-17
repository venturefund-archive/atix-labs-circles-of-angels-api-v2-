const SECONDS_IN_A_HOUR = 3600;
const MS_IN_A_SECOND = 1000;

module.exports = {
  addHours: (numOfHours, date = new Date()) => {
    date.setTime(
      date.getTime() + numOfHours * SECONDS_IN_A_HOUR * MS_IN_A_SECOND
    );
    return date;
  }
};
