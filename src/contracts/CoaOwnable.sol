pragma solidity ^0.5.8;

contract CoaOwnable {
    address public coaAddress;

    modifier onlyCoa() {
        require(
            address(coaAddress) == msg.sender,
            'Only COA can call this function'
        );
        _;
    }
}
