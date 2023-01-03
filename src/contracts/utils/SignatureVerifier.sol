pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';

/**
 * @dev Contract for verifying the signatures of the authorization message for performing actions on behalf of users
 *
 * TODO: Add nonces to signatures to avoid potential replay attacks
 *       This isn't sth core right now as the only sender of txs are our wallets
 */
library SignatureVerifier {

    bytes constant prefix = "\x19Ethereum Signed Message:\n32";

    /**
     * @notice Verifies that the signature of a message hash is correct, and returns the signer address
     * @param messageHash - the hash of the message
     * @param signature - the signature of the message hash
     */
    function verify(
        bytes32 messageHash,
        bytes memory signature
    )
        internal
        pure
        returns (address)
    {
        // Add message prefix to the message hash
        bytes32 prefixedMessageHash = keccak256(abi.encodePacked(prefix, messageHash));

        // Recover signer
        address signer = ECDSA.recover(prefixedMessageHash, signature);
        return signer;
    }
}