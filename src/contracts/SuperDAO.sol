pragma solidity ^0.5.8;

import '@openzeppelin/contracts/math/SafeMath.sol';
import "./UpgradeableToV1.sol";
import "./CoaOwnable.sol";
import "./old/SuperDAO_v0.sol";

/// @title This contracts is a DAO but will also process new dao creation proposals
contract SuperDAO is SuperDAO_v0, CoaOwnable, UpgradeableToV1 {
    using SafeMath for uint256;

    /**
     * @param _coaAddress Address of COA contract
     * @param _periodDuration Duration of a period
     * @param _votingPeriodLength Voting period quantity
     * @param _gracePeriodLength Grace period quantity
     */
    function superDaoUpgradeToV1(
        address _coaAddress,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _gracePeriodLength
    ) public upgraderToV1 {
        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        gracePeriodLength = _gracePeriodLength;
        processingPeriodLength = votingPeriodLength.add(gracePeriodLength);
        coaAddress = _coaAddress;
    }

    uint256[50] private _gap;
}
