pragma solidity ^0.5.8;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import '../../../contracts/UsersWhitelist.sol';
import '../../../contracts/UpgradeableToV1.sol';
import '../../../contracts/old/DAO_v0.sol';
import '../../../contracts/CoaOwnable.sol';

/// @title A DAO contract based on MolochDAO ideas
contract DAOV2 is DAO_v0, CoaOwnable, UpgradeableToV1, GSNRecipient {
    using SafeMath for uint256;

    UsersWhitelist public whitelist;

    string public test;

    /**
     * @param _whitelist address of the whitelist
     * @param _coaAddress Address of COA contract
     * @param _relayHubAddr Address of relay hub contractv
     * @param _periodDuration Duration of a period
     * @param _votingPeriodLength Voting period quantity
     * @param _gracePeriodLength Grace period quantity
     */
    function daoUpgradeToV1(
        address _whitelist,
        address _coaAddress,
        address _relayHubAddr,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _gracePeriodLength
    ) public upgraderToV1 {
        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        gracePeriodLength = _gracePeriodLength;
        processingPeriodLength = votingPeriodLength.add(gracePeriodLength);
        whitelist = UsersWhitelist(_whitelist);
        coaAddress = _coaAddress;
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    /**
     * @param _name DAO name
     * @param _creator User that will be assigned as the first member
     * @param _whitelist address of the whitelist
     * @param _coaAddress Address of COA contract
     * @param _relayHubAddr Address of relay hub contractv
     * @param _periodDuration Duration of a period
     * @param _votingPeriodLength Voting period quantity
     * @param _gracePeriodLength Grace period quantity
     */
    function initDao(
        string memory _name,
        address _creator,
        address _whitelist,
        address _coaAddress,
        address _relayHubAddr,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _gracePeriodLength
    ) public initializer {
        AbstractDAO_v0.initialize(_name, _creator);
        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        gracePeriodLength = _gracePeriodLength;
        processingPeriodLength = votingPeriodLength.add(gracePeriodLength);
        whitelist = UsersWhitelist(_whitelist);
        coaAddress = _coaAddress;
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    function setDefaultRelayHub() public onlyCoa {
        super.setDefaultRelayHub();
    }

    function setWhitelist(address _whitelist) public onlyMembers {
        whitelist = UsersWhitelist(_whitelist);
    }

    function acceptRelayedCall(
        address,
        address from,
        bytes calldata,
        uint256,
        uint256,
        uint256,
        uint256,
        bytes calldata,
        uint256
    ) external view returns (uint256, bytes memory) {
        Member storage member = members[from];
        if (whitelist.users(from) || member.exists == true) {
            return _approveRelayedCall();
        } else {
            return _rejectRelayedCall(0);
        }
    }

    function _preRelayedCall(bytes memory) internal returns (bytes32) {
        return 0;
    }

    function _postRelayedCall(
        bytes memory,
        bool,
        uint256,
        bytes32
    ) internal {}

    function withdrawDeposits(
        uint256 amount,
        address payable destinationAddress
    ) external onlyCoa {
        _withdrawDeposits(amount, destinationAddress);
    }

    function setTest(string memory _test) public {
        test = _test;
    }

    uint256[49] private _gap;
}
