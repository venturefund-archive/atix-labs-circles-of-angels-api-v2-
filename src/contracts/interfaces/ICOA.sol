pragma solidity ^0.5.8;

/// @title COA main contract to store projects related information
interface ICOA {
    /// Emitted when a new Project is created
    event ProjectCreated(uint256 id, string initialAgreement);

    /**
     * @notice Submits the initial agreement of a project
     * @dev the initial settlement could be included on the project creation, it was kept separated only for compatibility
     *      with existing code in the backend
     */
    function createProject(
        uint256 _projectId,
        string calldata _initialAgreementHash
    )
        external;

    /**
     * @notice proposes a new project agreement
     *         The owner of the contract acts as the relayer, by propagating a signature by the proposer
     * @dev the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
     *      we could strip the first two bytes but for now it seems unnecessary
     * @param _projectId - the id of the project's agreement that's proposed to be altered
     * @param _proposedAgreementHash - the hash of the new proposed project's agreement
     * @param _authorizationSignature - the authorization signature by the new agreement proposer
     */
    function proposeProjectAgreement(
        uint256 _projectId,
        string calldata _proposedAgreementHash,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Submits the audit result (approve/reject) of a proposed agreement
     * @param _projectId - id of the project the agreement belongs to
     * @param _agreementHash - string of the agreement's hash.
     * @param _author - of the proposed agreement that's being audited
     * @param _approved - the result of the audit, whether it's approved or rejected 
     */
    function submitProjectAgreementAuditResult(
        uint256 _projectId,
        string calldata _agreementHash,
        address _author,
        bool _approved
    ) external;

    // Returns the number of projects created
    function getNumberOfProjects() external view returns (uint256);
}
