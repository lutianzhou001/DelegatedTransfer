// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interfaces/IEIP712Resolve.sol";

contract EIP712Resolve is IEIP712Resolve {

    function getChainId() public view returns (uint) {
        return block.chainid;
    }

    function batchExecuteSetIfSignatureMatch(
      EIP712ResolveParams[] memory paramsArray
    ) external override {
        for (uint i = 0; i < paramsArray.length; i++) {
            executeSetIfSignatureMatch(paramsArray[i]);
        }
    }

    function executeSetIfSignatureMatch(EIP712ResolveParams memory params) public override {
        require(block.timestamp < params.deadline, "Signed transaction expired");

        uint chainId;
        assembly {
            chainId := chainid()
        }
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("TransferTest")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );

        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256("transfer(address sender,address x,address token,uint amount,uint deadline)"),
                params.sender,
                params.x,
                params.token,
                params.amount,
                params.deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
        address signer = ecrecover(hash, params.v, params.r, params.s);
        require(signer == params.sender, "EIP712Resolve: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");
        IERC20(params.token).transferFrom(params.sender, params.x, params.amount);
    }
}