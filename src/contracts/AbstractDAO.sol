pragma solidity ^0.5.8;

import '@openzeppelin/contracts/math/SafeMath.sol';
import './v0/AbstractDAO_v0.sol';
import './CoaOwnable.sol';

/**
 * @title A DAO contract based on MolochDAO ideas
 * @dev after deleting unused code this contract was left empty, it was kept only for easier compatibility with existing codebase
 *      once v0 contracts are merged with v1 contracts this empty contract should dissappear
 */
contract AbstractDAO is AbstractDAO_v0, CoaOwnable {
    using SafeMath for uint256;

    uint256[50] private _gap;
}
