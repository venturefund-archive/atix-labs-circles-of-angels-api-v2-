pragma solidity ^0.5.8;

/**
 * @title This contract holds information about claims made buy COA members
 */
contract IClaimsRegistry {
    // Emitted when a claim's audit result is submitted
    event ClaimAudited(
        address indexed project,
        address indexed validator,
        bytes32 indexed claim,
        bool _approved,
        bytes32 proof,
        uint256 verifiedAt,
        uint256 milestone
    );

    /**
     * @notice Proposes a claim, by sending it's hash and proof
     *         The owner of the contract acts as the relayer, by propagating a signature by the proposer
     * @param _projectId - the id of the project the claim is from.
     * @param _claim - bytes32 of the claim's hash.
     * @param _proof - bytes32 of the hash of the proof of the claim.
     * @param _milestone - the milestone identifier.
     * @param _authorizationSignature - the signature of the params by the proposer of the claim.
     */
    function proposeClaim(
        uint256 _projectId,
        bytes32 _claim,
        bytes32 _proof,
        uint256 _milestone,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Submits an audit result (if it was approved or rejected) of a proposed claim.
     *         The owner of the contract acts as the relayer, by propagating a signature by the auditor
     * @param _projectId - the id of the project the claim is from.
     * @param _claim - bytes32 of the claim's hash being audited.
     * @param _author - the author of the claim being audited.
     * @param _approved - true if the claim is approved, false otherwise.
     * @param _authorizationSignature - the signature of the params by the auditor.
     */
    function submitClaimAuditResult(
        uint256 _projectId,
        bytes32 _claim,
        address _author,
        bool _approved,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Checks whether the tasks from a project's milestone are approved).
     * @param _projectId - address of a project.
     * @param _validators - array of addresses of the validators.
     * @param _claims - array of bytes32 hashes of the claims.
     */
    function areApproved(
        uint256 _projectId,
        address[] calldata _validators,
        bytes32[] calldata _claims
    ) external view returns (bool);

}
