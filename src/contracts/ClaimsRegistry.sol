pragma solidity ^0.5.8;

import './v0/ClaimsRegistry_v0.sol';
import "./UpgradeableToV1.sol";

/**
 * @title This contract holds information about claims made by COA members
 * @dev after deleting unused code this contract was left empty, it was kept only for easier compatibility with existing codebase
 *      once v0 contracts are merged with v1 contracts this empty contract should dissappear
 */
contract ClaimsRegistry is ClaimsRegistry_v0, UpgradeableToV1 {

    function claimUpgradeToV1(address _owner) public upgraderToV1 {
        Ownable._transferOwnership(_owner);
    }

    uint256[50] private _gap;
}
