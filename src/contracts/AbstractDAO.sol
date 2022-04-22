pragma solidity ^0.5.8;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import './UsersWhitelist.sol';
import './old/AbstractDAO_v0.sol';
import './CoaOwnable.sol';

/// @title A DAO contract based on MolochDAO ideas
contract AbstractDAO is AbstractDAO_v0, CoaOwnable, GSNRecipient {
    using SafeMath for uint256;

    UsersWhitelist public whitelist;

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

    uint256[50] private _gap;
}
