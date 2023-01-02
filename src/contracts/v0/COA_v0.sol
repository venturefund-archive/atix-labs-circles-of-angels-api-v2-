pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol';
import '../ClaimsRegistry.sol';

import '@nomiclabs/buidler/console.sol';
/// @title COA main contract to store projects related information
contract COA_v0 is Initializable, Ownable {
    struct Member {
        string profile;
    }
    /// Projects list
    //Project[] public projects;
    AdminUpgradeabilityProxy[] public projects;
    /// COA members
    mapping(address => Member) public members;
    // Agreements by project address => agreementHash
    mapping(address => string) public agreements;

    /// Emitted when a new Project is created
    event ProjectCreated(uint256 id, address addr);

    address internal proxyAdmin;
    address internal implProject;

    function coaInitialize(
        address _proxyAdmin,
        address _implProject
    ) public initializer {
        Ownable.initialize(msg.sender);
        proxyAdmin = _proxyAdmin;
        implProject = _implProject;
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

    /**
     * @notice Creates a Project, can only be run by the admin
     * @dev A new contract is deployed per project created
     * @param _name - string of the Project's name.
     * @return address - the address of the new project
     */
    function createProject(uint256 _id, string calldata _name)
        external
        onlyOwner
        returns (address)
    {
        bytes memory payload =
            abi.encodeWithSignature('initialize(string)', _name);
        AdminUpgradeabilityProxy proxy =
            new AdminUpgradeabilityProxy(implProject, proxyAdmin, payload);
        projects.push(proxy);
        emit ProjectCreated(_id, address(proxy));
        return address(proxy);
    }

    // the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    /**
     * @dev Adds an agreement hash to the agreements map. This can only be run by the admin
     * @param _project - address of the project the agreement belongs to
     * @param _agreementHash - string of the agreement's hash.
     */
    function addAgreement(address _project, string calldata _agreementHash)
        external
        onlyOwner()
    {
        agreements[_project] = _agreementHash;
    }

    function getProjectsLength() public view returns (uint256) {
        return projects.length;
    }

    uint256[50] private _gap;
}
