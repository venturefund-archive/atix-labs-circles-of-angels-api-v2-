const logger = require('../../../logger');
const {
  claimMilestoneStatus,
  txFunderStatus,
  txEvidenceStatus
} = require('../../../util/constants');
// TODO: see if we can inject this service
const milestoneService = require('../../milestoneService');
const transferService = require('../../transferService');
const activityService = require('../../activityService');

module.exports = {
  ClaimApproved: async (
    projectId,
    validator,
    claim,
    approved,
    proof,
    verifiedAt,
    milestoneIdHex,
    tx
  ) => {
    const { transactionHash } = tx;
    logger.info(
      '[ClaimsRegistry] :: Incoming event ClaimApproved - claim:',
      claim
    );
    const milestoneId = Number(milestoneIdHex);
    if (milestoneId === 0) {
      logger.info('[ClaimsRegistry] :: Transfer fund claim created');
      const status = approved
        ? txFunderStatus.PENDING_VERIFICATION
        : txFunderStatus.CANCELLED;
      const updated = await transferService.updateTransferStatusByTxHash(
        transactionHash,
        status
      );
      if (updated) {
        logger.info(
          `[ClaimsRegistry] :: Transfer ${
            updated.transferId
          } status updated to ${status}`
        );
      } else {
        logger.info(
          `[ClaimsRegistry] :: Couldn't update transfer with txHash ${transactionHash}`
        );
      }
      return;
    }
    logger.info('[ClaimsRegistry] :: Evidence claim created');

    const updated = await activityService.updateEvidenceStatusByTxHash(
      transactionHash,
      txEvidenceStatus.PENDING_VERIFICATION
    );
    if (updated) {
      logger.info(
        `[ClaimsRegistry] :: Evidence ${updated.evidenceId} status updated to ${
          txEvidenceStatus.PENDING_VERIFICATION
        }`
      );
      const milestoneCompleted = await milestoneService.isMilestoneCompleted(
        milestoneId
      );

      const milestone = await milestoneService.getMilestoneById(milestoneId);
      if (
        milestoneCompleted &&
        milestone.claimStatus === claimMilestoneStatus.TRANSFERRED
      ) {
        logger.info(
          `[ClaimsRegistry] :: Milestone ${milestoneId} completed. Marking next as claimable`
        );
        await milestoneService.setNextAsClaimable(milestoneId);
      }
    } else {
      logger.info(
        `[ClaimsRegistry] :: Couldn't update evidence with txHash ${transactionHash}`
      );
    }
  }
};
