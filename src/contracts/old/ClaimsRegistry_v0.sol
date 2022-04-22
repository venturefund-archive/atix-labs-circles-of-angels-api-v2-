pragma solidity ^0.5.8;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
/**
 * @title This contract holds information about claims made buy COA members
 * @dev loosely based on ERC780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780 now it has been heavily changed.
 */
contract ClaimsRegistry_v0 is Initializable{
    struct Claim {
        bool approved;
        bytes32 proof;
    }

    // Claim[] can be used to amend previous verifications
    // Claim by project address => validator address => claim's hash => claim.
    mapping(address => mapping(address => mapping(bytes32 => Claim))) public registry;

    // Emitted when a claim is added
    event ClaimApproved(
        address indexed project,
        address indexed validator,
        bytes32 indexed claim,
        bool _approved,
        bytes32 proof,
        uint256 verifiedAt,
        uint256 milestone
    );

    function initialize() public initializer {
    }

    /**
     * @notice Adds a claim into the registry.
     * @param _project - address of a project.
     * @param _claim - bytes32 of the claim's hash.
     * @param _proof - bytes32 of the proof's hash.
     * @param _approved - true if the claim is approved, false otherwise.
     */
    function addClaim(
        address _project,
        bytes32 _claim,
        bytes32 _proof,
        bool _approved,
        uint256 _milestone
    ) public {
        address validator = msg.sender;
        registry[_project][validator][_claim] = Claim({
            approved: _approved,
            proof: _proof
        });

        emit ClaimApproved(
            _project,
            validator,
            _claim,
            _approved,
            _proof,
            now,
            _milestone
        );
    }

    /**
     * @notice Checks whether the tasks from a project's milestone are approved).
     * @param _project - address of a project.
     * @param _validators - array of addresses of the validators.
     * @param _claims - array of bytes32 hashes of the claims.
     */
    function areApproved(
        address _project,
        address[] calldata _validators,
        bytes32[] calldata _claims
    ) external view returns (bool) {
        require(
            _validators.length == _claims.length,
            'arrays must be equal size'
        );
        for (uint256 i = 0; i < _claims.length; i++) {
            Claim memory claim = registry[_project][_validators[i]][_claims[i]];
            if (!claim.approved) return false;
        }
        return true;
    }

    uint256[50] private _gap;
}
