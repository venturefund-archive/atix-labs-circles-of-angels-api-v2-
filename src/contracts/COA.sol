pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';
import './UpgradeableToV1.sol';
import './AbstractDAO.sol';
import './old/COA_v0.sol';

/// @title COA main contract to store projects related information
contract COA is COA_v0, UpgradeableToV1 {
    using ECDSA for bytes32;

    uint256 public daoPeriodDuration;
    uint256 public daoVotingPeriodLength;
    uint256 public daoGracePeriodLength;

    function coaUpgradeToV1(
        address _implDao,
        uint256 _daoPeriodDuration,
        uint256 _daoVotingPeriodLength,
        uint256 _daoGracePeriodLength
    ) public upgraderToV1 {
        implDao = _implDao;
        daoPeriodDuration = _daoPeriodDuration;
        daoVotingPeriodLength = _daoVotingPeriodLength;
        daoGracePeriodLength = _daoGracePeriodLength;
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
                'initDao(string,address,address,uint256,uint256,uint256)',
                _name,
                _creator,
                address(this),
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

    uint256[50] private _gap;
}
