pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract ProjectV2 is Initializable, Ownable {
    using SafeMath for uint256;

    string public name;
    address public entrepreneurAddress;

    mapping(bytes32 => bool) public isClaimValidated;

    string public test;

    function initialize(string memory _name) public payable initializer {
        Ownable.initialize(msg.sender);
        name = _name;
    }

    function setTest(string memory _test) public {
        test = _test;
    }

    uint256[49] private _gap;
}
