pragma solidity ^0.5.8;

import '../../../contracts/ClaimsRegistry.sol';
import '../../../contracts/utils/UpgradeableToV1.sol';
import './VariableStorageForTests.sol';

/**
 * @title V2 of the ClaimsRegistry contract, extending it's behavior with the VariableStorageForTests
 *        Used only for testing purposes
 */
contract ClaimsRegistryV1ForTests is ClaimsRegistry, VariableStorageForTests, UpgradeableToV1 {

    function claimUpgradeToV1(
        address _owner,
        string calldata _initialVariable
    ) external upgraderToV1 {
        Ownable._transferOwnership(_owner);
        setVariable(_initialVariable);
    }

    uint256[49] private _gap;
}
