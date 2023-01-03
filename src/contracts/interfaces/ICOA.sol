pragma solidity ^0.5.8;

/// @title Stores projects related information
interface ICOA {
    /// Emitted when a new Project is created
    event ProjectCreated(uint256 id, string ipfsHash);

    /**
     * @notice Creates a Project, can only be run by the admin
     *         Submits the initial IPFS hash of a project
     * @dev Validations being performed:
     *       - The sender is the contract owner
     *       - There's no created project with the same id
     * @param _projectId - the id of the project created
     * @param _initialIpfsHash - the IPFS hash of the newly created project
     */
    function createProject(
        uint256 _projectId,
        string calldata _initialIpfsHash
    ) external;

    /**
     * @notice proposes a project edit
     *         It can only be run by the owner of the contract, which acts as the relayer, by propagating a signature of the proposer
     * @dev Validations being performed:
     *       - The sender is the contract owner
     *       - The project edited exists
     *       - Note, there can be multiple proposals if they are from different users, and a user can override his proposal by sending a new one
     * @param _projectId - the id of the project that's proposed to be edited
     * @param _proposedIpfsHash - the new proposed project's IPFS hash
     * @param _proposerEmail - the email of the proposer
     * @param _authorizationSignature - the authorization signature by the edit proposer
     */
    function proposeProjectEdit(
        uint256 _projectId,
        string calldata _proposedIpfsHash,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    ) external;

    /**
     * @notice Approves/rejects a proposed project edit
     *         This can only be run by the admin
     * @dev Validations being performed:
     *       - The sender is the contract owner
     *       - The proposal exists, and has the parameter IPFS hash
     * @param _projectId - id of the project the edit belongs to
     * @param _ipfsHash - the IPFS hash of the project edit being audited.
     * @param _authorAddress - the address of the author of the proposal
     * @param _approved - the audt result, whether the proposal was approved or not
     */
    function submitProjectEditAuditResult(
        uint256 _projectId,
        string calldata _ipfsHash,
        address _authorAddress,
        bool _approved
    ) external;

    // Returns the number of projects created
    function getProjectsLength() external view returns (uint256);
}
