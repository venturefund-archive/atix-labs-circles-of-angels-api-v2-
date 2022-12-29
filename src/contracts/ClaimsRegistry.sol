pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import "./UpgradeableToV1.sol";
import './UsersWhitelist.sol';
import './old/ClaimsRegistry_v0.sol';

/**
 * @title This contract holds information about claims made buy COA members
 * @dev loosely based on ERC780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780 now it has been heavily changed.
 */
contract ClaimsRegistry is ClaimsRegistry_v0, Ownable, UpgradeableToV1, GSNRecipient {

    UsersWhitelist public whitelist;

    function claimUpgradeToV1(address _whitelist, address _owner, address _relayHubAddr) public upgraderToV1 {
        Ownable._transferOwnership(_owner);
        // Initialize ClaimsRegistry
        whitelist = UsersWhitelist(_whitelist);
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    function setDefaultRelayHub() public onlyOwner {
        super.setDefaultRelayHub();
    }

    /**
     * @notice Allows updating the whitelist contract used, which limits the users that can use the GSN
     * @dev Used mainly for enabling more configuration for the tests
     * @param _whitelist the new address of the whitelist contract
     */
    function setWhitelist(address _whitelist) external onlyOwner {
        whitelist = UsersWhitelist(_whitelist);
    }

    function acceptRelayedCall(
        address ,
        address from,
        bytes calldata,
        uint256 ,
        uint256 ,
        uint256 ,
        uint256 ,
        bytes calldata ,
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

    function _postRelayedCall(bytes memory, bool, uint256, bytes32) internal {}

    function withdrawDeposits(
        uint256 amount,
        address payable destinationAddress
    ) external onlyOwner {
        require(destinationAddress != address(0), 'Address cannot be empty');
        require(amount > 0, 'Amount cannot be ZERO');
        _withdrawDeposits(amount, destinationAddress);
    }

    uint256[50] private _gap;
}
