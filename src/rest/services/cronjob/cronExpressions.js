/*
 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11 (Jan-Dec)
 * Day of Week: 0-6 (Sun-Sat)
 */

module.exports = {
  EVERYDAY_AT_MIDNIGHT: '0 0 0 * * *',
  EVERY_HOUR: '0 0 */1 * * *',
  EVERY_TEN_MINUTES: '0 */10 * * * *',
  EVERY_FIVE_MINUTES: '0 */5 * * * *'
};
