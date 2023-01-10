// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interfaces/IEIP712Resolve.sol";

contract EIP712Resolve is IEIP712Resolve {

    function getChainId() public view returns (uint) {
        return block.chainid;
    }

    mapping (address => uint) public nonces;

    function getNonce() external view override returns (uint) {
        return nonces[msg.sender];
    }

    function batchExecuteSetIfSignatureMatch(
      EIP712ResolveParams[] memory paramsArray
    ) external override {
        for (uint i = 0; i < paramsArray.length; i++) {
            executeSetIfSignatureMatch(paramsArray[i]);
        }
    }

    function executeSetIfSignatureMatch(EIP712ResolveParams memory params) public override {
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
                keccak256("transfer(address sender,address x,address token,uint amount,uint nonce,uint deadline)"),
                params.sender,
                params.x,
                params.token,
                params.amount,
                params.nonce,
                params.deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
        address signer = ecrecover(hash, params.v, params.r, params.s);
        if (signer == params.sender && signer != address(0) && block.timestamp < params.deadline && params.nonce == nonces[params.sender]) {
            (bool success, ) = params.token.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", params.sender, params.x, params.amount));
            if (success) {
                nonces[params.sender] = nonces[params.sender] + 1;
                IERC20(params.token).transferFrom(params.sender, params.x, params.amount);
                emit Transfer(params.sender, params.x, params.token, params.amount, params.deadline);
                console.log("Transfer executed");
            }
        } else {
            console.log('Transfer failed');
        }
    }

    // EVENTS
    event Transfer(address indexed sender, address indexed x, address indexed token, uint amount, uint deadline);
}
