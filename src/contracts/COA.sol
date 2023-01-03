pragma solidity ^0.5.8;

import './UpgradeableToV1.sol';
import './v0/COA_v0.sol';

/**
 * @title COA main contract to store projects related information
 * @dev after deleting unused code this contract was left empty, it was kept only for easier compatibility with existing codebase
 *      once v0 contracts are merged with v1 contracts this empty contract should dissappear
 */
contract COA is COA_v0, UpgradeableToV1 {

    function coaUpgradeToV1(address _owner) public upgraderToV1 {
        Ownable._transferOwnership(_owner);
    }

    uint256[50] private _gap;
}
