pragma solidity ^0.5.8;

import '@openzeppelin/contracts/math/SafeMath.sol';
import './UpgradeableToV1.sol';
import './v0/DAO_v0.sol';
import './CoaOwnable.sol';

/// @title A DAO contract based on MolochDAO ideas
contract DAO is DAO_v0, CoaOwnable, UpgradeableToV1 {
    using SafeMath for uint256;

    /**
     * @param _coaAddress Address of COA contract
     * @param _periodDuration Duration of a period
     * @param _votingPeriodLength Voting period quantity
     * @param _gracePeriodLength Grace period quantity
     */
    function daoUpgradeToV1(
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

    /**
     * @param _name DAO name
     * @param _creator User that will be assigned as the first member
     * @param _coaAddress Address of COA contract
     * @param _periodDuration Duration of a period
     * @param _votingPeriodLength Voting period quantity
     * @param _gracePeriodLength Grace period quantity
     */
    function initDao(
        string memory _name,
        address _creator,
        address _coaAddress,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _gracePeriodLength
    ) public initializer {
        AbstractDAO_v0.initialize(_name, _creator);
        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        gracePeriodLength = _gracePeriodLength;
        processingPeriodLength = votingPeriodLength.add(gracePeriodLength);
        coaAddress = _coaAddress;
    }

    uint256[50] private _gap;
}
