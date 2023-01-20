pragma solidity ^0.5.8;

/**
 * @title This contract holds information about claims made buy COA members
 */
interface IClaimsRegistry {
    // Emitted when a claim's proposal is submitted
    event ClaimProposed(
        uint256 indexed projectId,
        address indexed proposer,
        bytes32 indexed claimHash,
        string proofHash,
        uint256 proposedAt,
        uint256 activityId
    );

    // Emitted when a claim's audit result is submitted
    event ClaimAudited(
        uint256 indexed projectId,
        address indexed auditor,
        bytes32 indexed claimHash,
        bool _approved,
        string proofHash,
        uint256 verifiedAt,
        uint256 activityId
    );

    /**
     * @notice Proposes a claim, by sending it's hash and proof
     *         The owner of the contract acts as the relayer, by propagating a signature by the proposer
     * @dev Validations being performed:
     *       - The sender is the contract owner
     *      Note: the identifier of a proposal is projectId+claimHash+proposerAddress, allowing
     *            multiple proposals to exists for different proposers
     *      Note: a user can override a proposal by sending a new one
     * @param _projectId - the id of the project the claim is from.
     * @param _claimHash - bytes32 of the claim's hash.
     * @param _proofHash - IPFS hash of the proof of the claim.
     * @param _activityId - the activity identifier.
     * @param _proposerEmail - the email of the user proposing the claim.
     * @param _authorizationSignature - the signature of the params by the proposer of the claim.
     */
    function proposeClaim(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proofHash,
        uint256 _activityId,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Submits the approval of a proposed claim as the result of the audit.
     *         The owner of the contract acts as the relayer, by propagating a signature by the auditor.
     * @dev Validations being performed:
     *       - The proposal exists
     *       - The proposal has the same proof hash as being passed as parameter
     *       - The auditor didn't already submit his audit
     * @param _projectId - the id of the project the claim is from.
     * @param _claimHash - bytes32 of the claim's hash being audited.
     * @param _proposalProofHash - IPFS hash of the proof from the proposal.
     *                             This is required as it's allowed for a user to override his proposal,
     *                             preventing this from the auditor approving a proposal he didn't intended.
     * @param _auditIpfsHash - IPFS hash of the audit report
     * @param _proposerAddress - address of the proposer of the claim.
     * @param _auditorEmail - email of the author of the audit.
     * @param _authorizationSignature - the signature of the params by the auditor.
     */
    function submitClaimApproval(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proposalProofHash,
        string calldata _auditIpfsHash,
        address _proposerAddress,
        string calldata _auditorEmail,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Submits the rejection of a proposed claim as the result of the audit.
     *         The owner of the contract acts as the relayer, by propagating a signature by the auditor.
     * @dev Validations being performed:
     *       - The proposal exists
     *       - The proposal has the same proof hash as being passed as parameter
     *       - The auditor didn't already submit his audit
     * @param _projectId - the id of the project the claim is from.
     * @param _claimHash - bytes32 of the claim's hash being audited.
     * @param _proposalProofHash - IPFS hash of the proof from the proposal.
     *                             This is required as it's allowed for a user to override his proposal,
     *                             preventing this from the auditor approving a proposal he didn't intended.
     * @param _auditIpfsHash - IPFS hash of the audit report
     * @param _proposerAddress - address of the proposer of the claim.
     * @param _auditorEmail - email of the author of the audit.
     * @param _authorizationSignature - the signature of the params by the auditor.
     */
    function submitClaimRejection(
        uint256 _projectId,
        bytes32 _claimHash,
        string calldata _proposalProofHash,
        string calldata _auditIpfsHash,
        address _proposerAddress,
        string calldata _auditorEmail,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Checks whether the tasks from a project's milestone are approved).
     * @param _projectId - address of a project.
     * @param _auditors - array of addresses of the auditors.
     * @param _claims - array of bytes32 hashes of the claims.
     */
    function areApproved(
        uint256 _projectId,
        address[] calldata _auditors,
        bytes32[] calldata _claims
    ) external view returns (bool);
}
