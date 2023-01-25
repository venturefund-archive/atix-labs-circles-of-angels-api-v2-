pragma solidity ^0.5.8;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./utils/SignatureVerifier.sol";
import "./utils/StringUtils.sol";
import "./interfaces/IProjectsRegistry.sol";

/**
 * @title Stores projects related information
 */
contract ProjectsRegistry is Initializable, Ownable, IProjectsRegistry {
    // The IPFS hashes can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // We could strip the first two bytes but for now it seems unnecessary.
    // We are then representing ipfs hashes as strings
    struct ProjectDescription {
        // IPFS hash of the new project description proposal
        string proposalIpfsHash;
        // Address of the author of the proposal
        address authorAddress;
        // Email of the author of the proposal
        string authorEmail;
        // Used for determining whether this structure is initialized or not
        bool isCreated;
        // IPFS hash of the file for the audit
        // Is empty when a description wasn't yet reviewed
        string auditIpfsHash;
    }

    /// Project's ids list
    string[] public projectIds;
    // Pending project edits by
    // project id => proposer address => project description
    mapping(string => mapping(address => ProjectDescription)) public pendingEdits;
    // Project description by
    // project id => project description
    mapping(string => ProjectDescription) public projectsDescription;

    function registryInitialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function createProject(string calldata _projectId, string calldata _initialProposalIpfsHash) external onlyOwner {
        // Perform validations
        require(!projectsDescription[_projectId].isCreated, "The project is already created");

        // Save the initial project description
        projectsDescription[_projectId] = ProjectDescription({
            proposalIpfsHash: _initialProposalIpfsHash,
            auditIpfsHash: "",
            authorAddress: msg.sender,
            authorEmail: "",
            isCreated: true
        });

        // Append the project to our list
        projectIds.push(_projectId);

        // Emit event
        emit ProjectCreated(_projectId, _initialProposalIpfsHash);
    }

    function proposeProjectEdit(
        string calldata _projectId,
        string calldata _proposedIpfsHash,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    ) external onlyOwner {
        // Perform validations
        require(projectsDescription[_projectId].isCreated, "Project being edited doesn't exist");

        // Get the proposer address
        address proposerAddress =
            SignatureVerifier.verify(
                hashProposedEdit(_projectId, _proposedIpfsHash, _proposerEmail),
                _authorizationSignature
            );

        // Add the proposal to the pending edits
        pendingEdits[_projectId][proposerAddress] = ProjectDescription({
            proposalIpfsHash: _proposedIpfsHash,
            auditIpfsHash: "",
            authorAddress: proposerAddress,
            authorEmail: _proposerEmail,
            isCreated: true
        });

        // Emit event
        emit ProjectEditProposed(_projectId, proposerAddress, _proposedIpfsHash);
    }

    function submitProjectEditAuditResult(
        string calldata _projectId,
        string calldata _proposalIpfsHash,
        string calldata _auditIpfsHash,
        address _authorAddress,
        bool _approved
    ) external onlyOwner {
        // Perform validations
        ProjectDescription storage proposedEdit = pendingEdits[_projectId][_authorAddress];
        require(proposedEdit.isCreated, "The pending edit doesn't exists");
        require(
            StringUtils.areEqual(proposedEdit.proposalIpfsHash, _proposalIpfsHash),
            "The pending edit doesn't have the ipfs hash selected"
        );

        // Update the project description if needed
        if (_approved) {
            proposedEdit.auditIpfsHash = _auditIpfsHash;
            projectsDescription[_projectId] = proposedEdit;
        }

        // Delete the pending edit that was audited
        delete pendingEdits[_projectId][_authorAddress];

        // Emit event
        emit ProjectEditAudited(_projectId, _authorAddress, _proposalIpfsHash, _auditIpfsHash, _approved);
    }

    function getProjectsLength() external view returns (uint256) {
        return projectIds.length;
    }

    function hashProposedEdit(
        string memory _projectId,
        string memory _proposedIpfsHash,
        string memory _proposerEmail
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(_projectId, _proposedIpfsHash, _proposerEmail));
    }

    uint256[50] private _gap;
}
