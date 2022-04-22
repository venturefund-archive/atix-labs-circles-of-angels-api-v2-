pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '../COA.sol';
import './AbstractDAO_v0.sol';

/// @title This contracts is a DAO but will also process new dao creation proposals
contract SuperDAO_v0 is AbstractDAO_v0 {
    COA coa;

    function initialize(string memory _name,
        address _creator,
        address _coaAddress) public initializer {
        AbstractDAO_v0.initialize(_name, _creator);
        coa = COA(_coaAddress);
    }

    function processNewDaoProposal(string memory _name, address _applicant)
        internal
    {
        coa.createDAO(_name, _applicant);
    }

    function requireProposalTypeIsValid(ProposalType _proposalType) internal {
        require(
            _proposalType == ProposalType.NewMember ||
                _proposalType == ProposalType.AssignBank ||
                _proposalType == ProposalType.AssignCurator ||
                _proposalType == ProposalType.NewDAO,
            'Invalid Proposal Type'
        );
    }

    uint256[50] private _gap;
}
