pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import "../interfaces/IClaimsRegistry.sol";
import "../utils/SignatureVerifier.sol";

/**
 * @title This contract holds information about claims made by COA members
 * @dev this was originally based on EIP780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780
 *      but with current version more based on EIP1812 Ethereum Verifiable Claims https://eips.ethereum.org/EIPS/eip-1812,
 *      on which the user is not the sender of the tx but only part of it through a signature 
 */
contract ClaimsRegistry_v0 is IClaimsRegistry, Initializable, Ownable {
    struct ClaimProposal {
        bytes32 proof;
        uint256 activityId;
        address proposerAddress;
        string proposerEmail;
        // Used for determining whether this structure is initialized or not
        bool exists;
    }
    
    struct ClaimAudit {
        address auditorAddress;
        string auditorEmail;
        bool approved;
        // Used for determining whether this structure is initialized or not
        bool exists;
    }

    // Proposed claim by project id => proposer address => claim's hash => proposed claim
    mapping(uint256 => mapping(address => mapping(bytes32 => ClaimProposal))) public registryProposedClaims;
    // Claim by project id => auditor address => claim's hash => audit of claim.
    mapping(uint256 => mapping(address => mapping(bytes32 => ClaimAudit))) public registryAuditedClaims;

    function registryInitialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function proposeClaim(
        uint256 _projectId,
        bytes32 _claimHash,
        bytes32 _proofHash,
        uint256 _activityId,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        // Get the signer of the authorization message
        address proposerAddress = SignatureVerifier.verify(
            hashProposedClaim(
                _projectId,
                _claimHash,
                _proofHash,
                _activityId,
                _proposerEmail
            ),
            _authorizationSignature
        );

        // Register proposed claim
        registryProposedClaims[_projectId][proposerAddress][_claimHash] = ClaimProposal({
            proof: _proofHash,
            activityId: _activityId,
            proposerAddress: proposerAddress,
            proposerEmail: _proposerEmail,
            exists: true
        });
    }

    function submitClaimAuditResult(
        uint256 _projectId,
        bytes32 _claimHash,
        bytes32 _proofHash,
        address _proposerAddress,
        string calldata _auditorEmail,
        bool _approved,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        // Obtain the signer of the authorization msg
        address auditorAddress = SignatureVerifier.verify(
            hashClaimAuditResult(
                _projectId,
                _claimHash,
                _proofHash,
                _proposerAddress,
                _auditorEmail,
                _approved
            ),
            _authorizationSignature
        );

        // Perform validations
        ClaimProposal memory proposedClaim = registryProposedClaims[_projectId][_proposerAddress][_claimHash];
        require(proposedClaim.exists, "Claim wasn't proposed");
        require(proposedClaim.proof == _proofHash, "Claim proposal has different proof hash than expected");
        require(!registryAuditedClaims[_projectId][auditorAddress][_claimHash].exists, "Auditor already audited this claim");

        // Register audited claim
        registryAuditedClaims[_projectId][auditorAddress][_claimHash] = ClaimAudit({
            auditorAddress: auditorAddress,
            auditorEmail: _auditorEmail,
            approved: _approved,
            exists: true
        });

        // Emit event for the audited claim
        emit ClaimAudited(
            _projectId,
            auditorAddress,
            _claimHash,
            _approved,
            proposedClaim.proof,
            now,
            proposedClaim.activityId
        );
    }

    function areApproved(
        uint256 _projectId,
        address[] calldata _auditors,
        bytes32[] calldata _claims
    ) external view returns (bool) {
        require(
            _auditors.length == _claims.length,
            'arrays must be equal size'
        );
        for (uint256 i = 0; i < _claims.length; i++) {
            ClaimAudit memory claim = registryAuditedClaims[_projectId][_auditors[i]][_claims[i]];
            // If claim.approved then the ClaimProposal exists,
            // as it's checked when the audit result is processed
            if (!claim.approved) return false;
        }
        return true;
    }

    function hashProposedClaim(
        uint256 _projectId,
        bytes32 _claimHash,
        bytes32 _proofHash,
        uint256 _activityId,
        string memory _proposerEmail
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _projectId,
                _claimHash,
                _proofHash,
                _activityId,
                _proposerEmail
            )
        );
    }

    function hashClaimAuditResult(
        uint256 _projectId,
        bytes32 _claimHash,
        bytes32 _proofHash,
        address _proposerAddress,
        string memory _auditorEmail,
        bool _approved
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _projectId,
                _claimHash,
                _proofHash,
                _proposerAddress,
                _auditorEmail,
                _approved
            )
        );
    }

    uint256[50] private _gap;
}
