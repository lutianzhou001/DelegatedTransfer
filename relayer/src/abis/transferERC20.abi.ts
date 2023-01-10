export const transferERC20ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'x',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'token',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'address',
                        name: 'sender',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'x',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'token',
                        type: 'address',
                    },
                ],
                internalType: 'struct IEIP712Resolve.EIP712ResolveParams[]',
                name: 'paramsArray',
                type: 'tuple[]',
            },
        ],
        name: 'batchExecuteSetIfSignatureMatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'address',
                        name: 'sender',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'x',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'token',
                        type: 'address',
                    },
                ],
                internalType: 'struct IEIP712Resolve.EIP712ResolveParams',
                name: 'params',
                type: 'tuple',
            },
        ],
        name: 'executeSetIfSignatureMatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getChainId',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getNonce',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'nonces',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
