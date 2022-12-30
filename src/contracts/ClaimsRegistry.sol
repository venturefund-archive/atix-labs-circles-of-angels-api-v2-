pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import "./UpgradeableToV1.sol";
import './old/ClaimsRegistry_v0.sol'; // FIXME: rename this folder to v0 instead of old

/**
 * @title This contract holds information about claims made buy COA members
 * @dev loosely based on ERC780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780 now it has been heavily changed.
 * @dev after deleting unused code this contract was left empty, it was kept only for easier compatibility with existing codebase
 *      once v0 contracts are merged with v1 contracts this empty contract should dissappear
 */
contract ClaimsRegistry is ClaimsRegistry_v0, Ownable, UpgradeableToV1 {

    function claimUpgradeToV1(address _owner) public upgraderToV1 {
        Ownable._transferOwnership(_owner);
    }

    uint256[50] private _gap;
}
