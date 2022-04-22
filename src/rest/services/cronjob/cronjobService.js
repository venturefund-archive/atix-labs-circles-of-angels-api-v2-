const config = require('config');
const { CronJob } = require('cron');
const jobs = require('./cronjobs');

const logger = require('../../logger');

module.exports = {
  crons: [],
  cronInit() {
    logger.info('[cronInit] :: Scheduling cronJobs');
    this.crons = Object.entries(jobs).map(([jobName, job]) => {
      const {
        cronTime,
        onTick,
        onComplete,
        timezone,
        runOnInit,
        disabled
      } = job;

      const cron = new CronJob(
        cronTime,
        onTick,
        onComplete,
        false,
        timezone,
        this,
        runOnInit
      );
      if (!disabled && !config.crons.disableAll) {
        logger.info('[cronInit] :: Starting job', jobName);
        cron.start();
      }
      return { disabled, jobName, cron };
    });
  },
  startAll() {
    if (config.crons.disabledAll) return;
    this.crons.forEach(({ disabled, jobName, cron }) => {
      if (!disabled) {
        logger.info('[cronInit] :: Starting job', jobName);
        cron.start();
      }
    });
  },
  start(job) {
    if (config.crons.disabledAll) return;
    const foundCron = this.crons.find(({ jobName }) => jobName === job);
    if (foundCron && !foundCron.disabled) {
      logger.info('[cronInit] :: Starting job', job);
      foundCron.cron.start();
    }
  },
  stopAll() {
    this.crons.forEach(({ jobName, cron }) => {
      logger.info('[cronInit] :: Stopping job', jobName);
      cron.stop();
    });
  },
  stop(job) {
    const foundCron = this.crons.find(({ jobName }) => jobName === job);
    if (foundCron) {
      logger.info('[cronInit] :: Stopping job', job);
      foundCron.cron.stop();
    }
  }
};
