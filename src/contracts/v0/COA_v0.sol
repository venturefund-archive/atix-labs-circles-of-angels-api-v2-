pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import "../utils/SignatureVerifier.sol";
import '../utils/StringUtils.sol';
import '../interfaces/ICOA.sol';

/**
 * @title Stores projects related information
 * FIXME: pending:
 *  - Review the changes I did in my last commit
 *  - Rename this contract to ProjectRegistry
 *  - Split the coa test file for each scenario
 */
contract COA_v0 is Initializable, Ownable, ICOA {
    struct Member {
        string profile;
    }
    struct ProjectDescription {
        // The IPFS hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
        // We could strip the first two bytes but for now it seems unnecessary.
        // We are then representing ipfs hashes as strings
        string ipfsHash;
        // Address of the author of the proposal
        address authorAddress;
        // Email of the author of the proposal
        string authorEmail;
        // Used for determining whether this structure is initialized or not
        bool isCreated;
    }

    /// COA members
    mapping(address => Member) public members;

    /// Project's ids list
    uint256[] public projectIds;
    // Pending project edits by 
    // project id => proposer address => project description
    mapping(uint256 => mapping(address => ProjectDescription)) public pendingEdits;
    // Project description by
    // project id => project description
    mapping(uint256 => ProjectDescription) public projectsDescription;

    function coaInitialize() public initializer {
        Ownable.initialize(msg.sender);
    }
    /**
     * @notice Adds a new member in COA.
     * @param _profile - string of the member's profile.
     *
     * @dev the profile can be bytes32 but IPFS hashes are 34 bytes long due to multihash. We could strip the first two bytes but for now it seems unnecessary.
     */
    function createMember(string calldata _profile) external {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[msg.sender] = member;
    }

    /**
     * @dev Migrates an old member in COA.
     * @param _profile - string of the member's profile.
     * @param _existingAddress - address of the old member
     */
    function migrateMember(string calldata _profile, address _existingAddress)
        external
        onlyOwner
    {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[_existingAddress] = member;
    }

    function createProject(
        uint256 _projectId,
        string calldata _initialIpfsHash
    )
        external
        onlyOwner
    {
        // Perform validations
        require(!projectsDescription[_projectId].isCreated, "The project is already created");

        // Save the initial project description
        projectsDescription[_projectId] = ProjectDescription({
            ipfsHash: _initialIpfsHash,
            authorAddress: msg.sender,
            authorEmail: "",
            isCreated: true
        });

        // Append the project to our list
        projectIds.push(_projectId);

        // Emit event
        emit ProjectCreated(_projectId, _initialIpfsHash);
    }

    function proposeProjectEdit(
        uint256 _projectId,
        string calldata _proposedIpfsHash,
        string calldata _proposerEmail,
        bytes calldata _authorizationSignature
    )
        external
        onlyOwner
    {
        // Perform validations
        require(projectsDescription[_projectId].isCreated, "Project being edited doesn't exist");

        // Get the proposer address
        address proposerAddreess = SignatureVerifier.verify(
            hashProposedEdit(
                _projectId,
                _proposedIpfsHash,
                _proposerEmail
            ),
            _authorizationSignature
        );

        // Add the proposal to the pending edits
        pendingEdits[_projectId][proposerAddreess] = ProjectDescription({
            ipfsHash: _proposedIpfsHash,
            authorAddress: proposerAddreess,
            authorEmail: _proposerEmail,
            isCreated: true
        });
    }

    function submitProjectEditAuditResult(
        uint256 _projectId,
        string calldata _ipfsHash,
        address _authorAddress,
        bool _approved
    )
        external
        onlyOwner
    {
        // Perform validations
        ProjectDescription storage proposedEdit = pendingEdits[_projectId][_authorAddress];
        require(proposedEdit.isCreated, "The pending edit doesn't exists");
        require(StringUtils.areEqual(proposedEdit.ipfsHash, _ipfsHash), "The pending edit doesn't have the ipfs hash selected");

        // Update the project description if needed
        if (_approved) {
            projectsDescription[_projectId] = proposedEdit;
        }

        // Delete the pending edit that was audited
        delete pendingEdits[_projectId][_authorAddress];
    }

    function getProjectsLength() external view returns (uint256) {
        return projectIds.length;
    }

    function hashProposedEdit(
        uint256 _projectId,
        string memory _proposedIpfsHash,
        string memory _proposerEmail
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _projectId,
                _proposedIpfsHash,
                _proposerEmail
            )
        );
    }

    uint256[50] private _gap;
}
