pragma solidity ^0.5.8;

import './UpgradeableToV1.sol';
import './v0/ProjectsRegistry_v0.sol';

/**
 * @title Stores projects related information
 * @dev after deleting unused code this contract was left empty, it was kept only for easier compatibility with existing codebase
 *      once v0 contracts are merged with v1 contracts this empty contract should dissappear
 */
contract ProjectsRegistry is ProjectsRegistry_v0, UpgradeableToV1 {

    function registryUpgradeToV1(address _owner) public upgraderToV1 {
        Ownable._transferOwnership(_owner);
    }

    uint256[50] private _gap;
}
