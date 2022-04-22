const { coa, web3 } = require('@nomiclabs/buidler');

const config = require('config');
const logger = require('../../logger');
const { EVERY_DAY_AT_MIDNIGHT, EVERY_HOUR } = require('./cronExpressions');

module.exports = {
  transitionProjectStatusJob: {
    cronTime:
      config.crons.transitionProjectStatusJob.cronTime || EVERY_DAY_AT_MIDNIGHT,
    async onTick() {
      logger.info('[CronJobService] :: Executing transitionProjectStatusJob');
      const updatedConsensusProjects = await this.projectService.transitionConsensusProjects();
      const updatedFundingProjects = await this.projectService.transitionFundingProjects();
      const updatedFinsihedProjects = await this.projectService.transitionFinishedProjects();
      const updatedProjects = [
        ...updatedConsensusProjects,
        ...updatedFundingProjects,
        ...updatedFinsihedProjects
      ];
      logger.info('[CronJobService] :: Updated projects:', updatedProjects);
    },
    onComplete() {
      logger.info('[CronJobService] :: transitionProjectStatusJob has stopped');
    },
    timezone: config.crons.transitionProjectStatusJob.timezone || undefined,
    runOnInit: config.crons.transitionProjectStatusJob.runOnInit || false,
    disabled: config.crons.transitionProjectStatusJob.disabled || false
  },
  checkFailedTransactionsJob: {
    cronTime: config.crons.checkFailedTransactionsJob.cronTime || EVERY_HOUR,
    async onTick() {
      logger.info('[CronJobService] :: Executing checkFailedTransactionsJob');
      await this.transferService.updateFailedTransactions();
      await this.activityService.updateFailedEvidenceTransactions();
      await this.daoService.updateFailedProposalTransactions();
      await this.daoService.updateFailedVoteTransactions();
    },
    onComplete() {
      logger.info('[CronJobService] :: checkFailedTransactionsJob has stopped');
    },
    timezone: config.crons.checkFailedTransactionsJob.timezone || undefined,
    runOnInit: config.crons.checkFailedTransactionsJob.runOnInit || false,
    disabled: config.crons.checkFailedTransactionsJob.disabled || false
  },
  checkContractBalancesJob: {
    cronTime:
      config.crons.checkContractBalancesJob.cronTime || EVERY_DAY_AT_MIDNIGHT,
    async onTick() {
      logger.info('[CronJobService] :: Executing checkContractBalancesJob');
      try {
        const signer = await coa.getSigner();
        const contracts = await coa.getAllRecipientContracts();
        await this.balanceService.checkGSNAccountBalance(coa);
        await this.balanceService.checkContractBalances(
          contracts,
          signer,
          web3
        );
      } catch (e) {
        logger.error(e);
      }
    },
    onComplete() {
      logger.info('[CronJobService] :: checkContractBalancesJob has stopped');
    },
    timezone: config.crons.checkContractBalancesJob.timezone || undefined,
    runOnInit: config.crons.checkContractBalancesJob.runOnInit || false,
    disabled: config.crons.checkContractBalancesJob.disabled || false
  }
};
