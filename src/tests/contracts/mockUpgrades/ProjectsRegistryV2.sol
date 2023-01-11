pragma solidity ^0.5.8;

import '../../../contracts/UpgradeableToV1.sol';
import '../../../contracts/v0/ProjectsRegistry_v0.sol';
import './VariableStorage.sol';

/**
 * @title V2 of the ProjectsRegistry contract, extending it's behavior with the VariableStorage
 *        Used only for testing purposes
 */
contract ProjectsRegistryV2 is ProjectsRegistry_v0, VariableStorage, UpgradeableToV1 {

    function registryUpgradeToV1(
        address _owner,
        string calldata _initialVariable
    ) external upgraderToV1 {
        Ownable._transferOwnership(_owner);
        setVariable(_initialVariable);
    }

    uint256[49] private _gap;
}
