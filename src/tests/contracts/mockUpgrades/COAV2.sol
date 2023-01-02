pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';
import '../../../contracts/UpgradeableToV1.sol';
import '../../../contracts/UsersWhitelist.sol';
import '../../../contracts/v0/COA_v0.sol';

/// @title COA main contract to store projects related information
contract COAV2 is COA_v0, UpgradeableToV1, GSNRecipient {
    using ECDSA for bytes32;

    UsersWhitelist public whitelist;

    uint256 public daoPeriodDuration;
    uint256 public daoVotingPeriodLength;
    uint256 public daoGracePeriodLength;

    string public test;

    modifier withdrawOk(uint256 _amount, address _destinationAddress) {
        require(_destinationAddress != address(0), 'Address cannot be empty');
        require(_amount > 0, 'Amount cannot be ZERO');
        _;
    }

    function coaUpgradeToV1(
        address _whitelist,
        address _relayHubAddr
    ) public upgraderToV1 {
        whitelist = UsersWhitelist(_whitelist);
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    function setDefaultRelayHub() public onlyOwner {
        super.setDefaultRelayHub();
    }

    function setWhitelist(address _whitelist) external onlyOwner {
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
        if (whitelist.users(from)) {
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
    ) external onlyOwner withdrawOk(amount, destinationAddress) {
        _withdrawDeposits(amount, destinationAddress);
    }

    function setTest(string memory _test) public {
        test = _test;
    }

    uint256[49] private _gap;
}
