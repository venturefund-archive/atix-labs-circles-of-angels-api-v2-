pragma solidity ^0.5.8;

library StringUtils {

    function areEqual(
        string memory s1,
        string memory s2
    )
        internal
        pure
        returns (bool)
    {
        if(bytes(s1).length != bytes(s2).length) {
            return false;
        } else {
            return keccak256(bytes(s1)) == keccak256(bytes(s2));
        }

    }
}