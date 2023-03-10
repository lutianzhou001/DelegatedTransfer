pragma solidity ^0.8.17;

interface IEIP712Resolve {

    struct EIP712ResolveParams {
        uint8 v;
        bytes32 r;
        bytes32 s;
        address sender;
        uint256 deadline;
        address x;
        uint256 amount;
        uint256 nonce;
        address token;
    }

    function getNonce() view external returns (uint);

    function executeSetIfSignatureMatch(EIP712ResolveParams memory params) external;

    function batchExecuteSetIfSignatureMatch(EIP712ResolveParams[] memory paramsArray) external;
}


