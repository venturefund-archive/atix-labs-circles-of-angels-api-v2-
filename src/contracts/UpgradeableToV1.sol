pragma solidity ^0.5.8;

/**
 * @title UpgradeableToV1
 *
 * @dev Helper contract to support upgrade functions. To use it, replace
 * the constructor with a function that has the `initializer` modifier.
 * WARNING: Unlike constructors, initializer functions must be manually
 * invoked. This applies both to deploying an UpgradeableToV1 contract, as well
 * as extending an UpgradeableToV1 contract via inheritance.
 * WARNING: When used with inheritance, manual care must be taken to not invoke
 * a parent initializer twice, or ensure that all initializers are idempotent,
 * because this is not dealt with automatically as with constructors.
 */
contract UpgradeableToV1 {
    /**
     * @dev Indicates that the contract has been upgraded to v1.
     */
    bool private upgradedToV1;

    /**
     * @dev Indicates that the contract is in the process of being upgraded to v1.
     */
    bool private upgradingToV1;

    /**
     * @dev Modifier to use in the upgraded function of a contract.
     */
    modifier upgraderToV1() {
        require(upgradingToV1 || !upgradedToV1, "Contract instance has already been upgraded to v1");

        bool isTopLevelCall = !upgradingToV1;
        if (isTopLevelCall) {
            upgradingToV1 = true;
            upgradedToV1 = true;
        }

        _;

        if (isTopLevelCall) {
            upgradingToV1 = false;
        }
    }

    function version() public pure returns (uint16) {
        return 1;
    }

    // Reserved storage space to allow for layout changes in the future.
    uint256[50] private ______gap;
}
