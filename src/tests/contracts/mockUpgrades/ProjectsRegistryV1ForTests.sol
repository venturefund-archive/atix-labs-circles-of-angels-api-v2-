pragma solidity ^0.5.8;

import "../../../contracts/ProjectsRegistry.sol";
import "../../../contracts/utils/UpgradeableToV1.sol";
import "./VariableStorageForTests.sol";

/**
 * @title V2 of the ProjectsRegistry contract, extending it's behavior with the VariableStorageForTests
 *        Used only for testing purposes
 */
contract ProjectsRegistryV1ForTests is ProjectsRegistry, VariableStorageForTests, UpgradeableToV1 {
    function registryUpgradeToV1(address _owner, string calldata _initialVariable) external upgraderToV1 {
        Ownable._transferOwnership(_owner);
        setVariable(_initialVariable);
    }

    uint256[49] private _gap;
}
