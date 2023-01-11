pragma solidity ^0.5.8;

import '../../../contracts/v0/ClaimsRegistry_v0.sol';
import '../../../contracts/UpgradeableToV1.sol';
import './VariableStorage.sol';

/**
 * @title V2 of the ClaimsRegistry contract, extending it's behavior with the VariableStorage
 *        Used only for testing purposes
 */
contract ClaimsRegistryV2 is ClaimsRegistry_v0, VariableStorage, UpgradeableToV1 {

    function claimUpgradeToV1(
        address _owner,
        string calldata _initialVariable
    ) external upgraderToV1 {
        Ownable._transferOwnership(_owner);
        setVariable(_initialVariable);
    }

    uint256[49] private _gap;
}
