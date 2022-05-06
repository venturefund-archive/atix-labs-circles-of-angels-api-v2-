pragma solidity ^0.5.8;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';

import '@nomiclabs/buidler/console.sol';

contract UsersWhitelist is Initializable, Ownable {

    mapping (address => bool) public users;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    function whitelistInitialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function addUser(address _user) public onlyOwner {
        require(users[_user] == false, "The user already exists in the whitelist.");
        users[_user] = true;
        emit AddedToWhitelist(_user);
    }

    function removeUser(address _user) public onlyOwner {
        require(users[_user] == true, "The user is not in the whitelist.");
        delete users[_user];
        emit RemovedFromWhitelist(_user);
    }

    uint256[50] private _gap;
}