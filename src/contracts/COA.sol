pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';
import './UpgradeableToV1.sol';
import './AbstractDAO.sol';
import './UsersWhitelist.sol';
import './old/COA_v0.sol';

/// @title COA main contract to store projects related information
contract COA is COA_v0, UpgradeableToV1, GSNRecipient {
    using ECDSA for bytes32;

    UsersWhitelist public whitelist;

    uint256 public daoPeriodDuration;
    uint256 public daoVotingPeriodLength;
    uint256 public daoGracePeriodLength;

    modifier withdrawOk(uint256 _amount, address _destinationAddress) {
        require(_destinationAddress != address(0), 'Address cannot be empty');
        require(_amount > 0, 'Amount cannot be ZERO');
        _;
    }

    function coaUpgradeToV1(
        address _whitelist,
        address _relayHubAddr,
        address _implDao,
        uint256 _daoPeriodDuration,
        uint256 _daoVotingPeriodLength,
        uint256 _daoGracePeriodLength
    ) public upgraderToV1 {
        implDao = _implDao;
        daoPeriodDuration = _daoPeriodDuration;
        daoVotingPeriodLength = _daoVotingPeriodLength;
        daoGracePeriodLength = _daoGracePeriodLength;
        whitelist = UsersWhitelist(_whitelist);
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    function setDefaultRelayHub() public onlyOwner {
        super.setDefaultRelayHub();
    }

    /**
     * @dev Create a DAO
     * @param _name - string of the DAO's name.
     * @param _creator - address of the first member of the DAO (i.e. its creator)
     * @return address - the address of the new dao
     */
    function createDAO(string calldata _name, address _creator)
        external
        returns (address)
    {
        require(
            proxyAdmin != _creator,
            'The creator can not be the proxy admin.'
        );
        bytes memory payload =
            abi.encodeWithSignature(
                'initDao(string,address,address,address,address,uint256,uint256,uint256)',
                _name,
                _creator,
                address(whitelist),
                address(this),
                GSNRecipient.getHubAddr(),
                daoPeriodDuration,
                daoVotingPeriodLength,
                daoGracePeriodLength
            );
        AdminUpgradeabilityProxy proxy =
            new AdminUpgradeabilityProxy(implDao, proxyAdmin, payload);
        daos.push(proxy);
        emit DAOCreated(address(proxy));
        return address(proxy);
    }

    function setWhitelist(address _whitelist) external onlyOwner {
        whitelist = UsersWhitelist(_whitelist);
    }

    function acceptRelayedCall(
        address,
        address from,
        bytes calldata,
        uint256,
        uint256,
        uint256,
        uint256,
        bytes calldata,
        uint256
    ) external view returns (uint256, bytes memory) {
        if (whitelist.users(from)) {
            return _approveRelayedCall();
        } else {
            return _rejectRelayedCall(0);
        }
    }

    function _preRelayedCall(bytes memory) internal returns (bytes32) {
        return 0;
    }

    function _postRelayedCall(
        bytes memory,
        bool,
        uint256,
        bytes32
    ) internal {}

    function withdrawDaoDeposits(
        uint256 amount,
        address payable destinationAddress,
        address contractFrom
    ) external onlyOwner withdrawOk(amount, destinationAddress) {
        AbstractDAO dao = AbstractDAO(contractFrom);
        dao.withdrawDeposits(amount, destinationAddress);
    }

    function withdrawDeposits(
        uint256 amount,
        address payable destinationAddress
    ) external onlyOwner withdrawOk(amount, destinationAddress) {
        _withdrawDeposits(amount, destinationAddress);
    }

    uint256[50] private _gap;
}
