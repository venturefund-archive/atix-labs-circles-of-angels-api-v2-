pragma solidity ^0.5.8;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./interfaces/IClaimsRegistry.sol";
import "./utils/SignatureVerifier.sol";
import "./utils/StringUtils.sol";

/**
 * @title This contract holds information about claims made by COA members
 * @dev this was originally based on EIP780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780
 *      but with current version more based on EIP1812 Ethereum Verifiable Claims
 *      https://eips.ethereum.org/EIPS/eip-1812, on which the user is not the sender of the tx but only part of
 *      it through a signature
 */
contract ClaimsRegistry is IClaimsRegistry, Initializable, Ownable {
    struct ClaimProposal {
        // The IPFS hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
        // We could strip the first two bytes but for now it seems unnecessary.
        // We are then representing ipfs hashes as strings
        string proofHash;
        uint256 activityId;
        address proposerAddress;
        string proposerEmail;
        // Used for determining whether this structure is initialized or not
        bool exists;
    }

    struct ClaimAudit {
        // Included as the original proposal could be edited
        ClaimProposal proposal;
        address auditorAddress;
        string auditorEmail;
        bool approved;
        // Used for determining whether this structure is initialized or not
        bool exists;
        string ipfsHash;
    }

    // Proposed claim by project id => proposer address => claim's hash => proposed claim
    mapping(uint256 => mapping(address => mapping(bytes32 => ClaimProposal))) public registryProposedClaims;
    // Claim by project id => auditor address => claim's hash => audit of claim.
    mapping(uint256 => mapping(address => mapping(bytes32 => ClaimAudit))) internal registryAuditedClaims;

    function registryInitialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function proposeClaim(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proofHash,
        uint256 _activityId,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        // Get the signer of the authorization message
        address proposerAddress =
            SignatureVerifier.verify(
                hashProposedClaim(_projectId, _claimHash, _proofHash, _activityId, _proposerEmail),
                _authorizationSignature
            );

        // Register proposed claim
        registryProposedClaims[_projectId][proposerAddress][_claimHash] = ClaimProposal({
            proofHash: _proofHash,
            activityId: _activityId,
            proposerAddress: proposerAddress,
            proposerEmail: _proposerEmail,
            exists: true
        });

        // Emit event for the claim proposed
        emit ClaimProposed(_projectId, proposerAddress, _claimHash, _proofHash, now, _activityId);
    }

    function submitClaimApproval(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proposalProofHash,
        string calldata _auditIpfsHash,
        address _proposerAddress,
        string calldata _auditorEmail,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        submitClaimAuditResult(
            _projectId,
            _claimHash,
            _proposalProofHash,
            _auditIpfsHash,
            _proposerAddress,
            _auditorEmail,
            true,
            _authorizationSignature
        );
    }

    function submitClaimRejection(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proposalProofHash,
        string calldata _auditIpfsHash,
        address _proposerAddress,
        string calldata _auditorEmail,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        submitClaimAuditResult(
            _projectId,
            _claimHash,
            _proposalProofHash,
            _auditIpfsHash,
            _proposerAddress,
            _auditorEmail,
            false,
            _authorizationSignature
        );
    }

    /// @dev This funciton was kept internal with 2 ways of calling to reduce the parameters of the external functions
    ///      For some reason 8 parameters causes the 0.5.8 compiler to fail
    function submitClaimAuditResult(
        uint256 _projectId,
        bytes32 _claimHash,
        string memory _proposalProofHash,
        string memory _auditIpfsHash,
        address _proposerAddress,
        string memory _auditorEmail,
        bool _approved,
        bytes memory _authorizationSignature
    ) internal onlyOwner {
        // Obtain the signer of the authorization msg
        address auditorAddress =
            SignatureVerifier.verify(
                hashClaimAuditResult(
                    _projectId,
                    _claimHash,
                    _proposalProofHash,
                    _auditIpfsHash,
                    _proposerAddress,
                    _auditorEmail,
                    _approved
                ),
                _authorizationSignature
            );

        // Perform validations
        ClaimProposal storage proposedClaim = registryProposedClaims[_projectId][_proposerAddress][_claimHash];
        require(proposedClaim.exists, "Claim wasn't proposed");
        require(
            StringUtils.areEqual(proposedClaim.proofHash, _proposalProofHash),
            "Claim proposal has different proof hash than expected"
        );
        require(
            !registryAuditedClaims[_projectId][auditorAddress][_claimHash].exists,
            "Auditor already audited this claim"
        );

        // Register audited claim
        registryAuditedClaims[_projectId][auditorAddress][_claimHash] = ClaimAudit({
            proposal: proposedClaim,
            ipfsHash: _auditIpfsHash,
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
            proposedClaim.proofHash,
            now,
            proposedClaim.activityId
        );
    }

    function areApproved(
        uint256 _projectId,
        address[] calldata _auditors,
        bytes32[] calldata _claims
    ) external view returns (bool) {
        require(_auditors.length == _claims.length, "arrays must be equal size");
        for (uint256 i = 0; i < _claims.length; i++) {
            ClaimAudit memory claim = registryAuditedClaims[_projectId][_auditors[i]][_claims[i]];
            // If claim.approved then the ClaimProposal exists,
            // as it's checked when the audit result is processed
            if (!claim.approved) return false;
        }
        return true;
    }

    /**
     * @notice Returns the audit information of a claim
     * @dev This function was created as structs inside structs are not supported for the contract's public interface
     * @param _projectId - the id of the project the queried claim belongs to.
     * @param _auditorAddress - the auditor of the queried claim.
     * @param _claimHash - the has of the queried claim.
     */
    function getClaimAudit(
        uint256 _projectId,
        address _auditorAddress,
        bytes32 _claimHash
    )
        public
        view
        returns (
            string memory,
            uint256,
            address,
            string memory,
            bool,
            address,
            string memory,
            bool,
            string memory
        )
    {
        ClaimAudit memory claimAudit = registryAuditedClaims[_projectId][_auditorAddress][_claimHash];

        return (
            claimAudit.proposal.proofHash,
            claimAudit.proposal.activityId,
            claimAudit.proposal.proposerAddress,
            claimAudit.proposal.proposerEmail,
            claimAudit.exists,
            claimAudit.auditorAddress,
            claimAudit.auditorEmail,
            claimAudit.approved,
            claimAudit.ipfsHash
        );
    }

    function hashProposedClaim(
        uint256 _projectId,
        bytes32 _claimHash,
        string memory _proofHash,
        uint256 _activityId,
        string memory _proposerEmail
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(_projectId, _claimHash, _proofHash, _activityId, _proposerEmail));
    }

    function hashClaimAuditResult(
        uint256 _projectId,
        bytes32 _claimHash,
        string memory _proposalProofHash,
        string memory _auditIpfsHash,
        address _proposerAddress,
        string memory _auditorEmail,
        bool _approved
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _projectId,
                    _claimHash,
                    _proposalProofHash,
                    _auditIpfsHash,
                    _proposerAddress,
                    _auditorEmail,
                    _approved
                )
            );
    }

    uint256[50] private _gap;
}
