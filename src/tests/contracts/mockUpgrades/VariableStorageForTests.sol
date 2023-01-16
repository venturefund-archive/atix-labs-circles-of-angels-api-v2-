pragma solidity ^0.5.8;

/**
 * @title Contract storing a string variable
 *        To be used for testing purposes only
 */
contract VariableStorageForTests {
    string public stringVariable;

    // Setter for the string variable
    function setVariable(string memory newValue) public {
        stringVariable = newValue;
    }
}
