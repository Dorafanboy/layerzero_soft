﻿export const angleBridgeAbi = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [],
        name: 'InsufficientGas',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidAllowance',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidCaller',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidEndpoint',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidParams',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidPayload',
        type: 'error',
    },
    {
        inputs: [],
        name: 'InvalidSource',
        type: 'error',
    },
    {
        inputs: [],
        name: 'NotGovernor',
        type: 'error',
    },
    {
        inputs: [],
        name: 'NotGovernorOrGuardian',
        type: 'error',
    },
    {
        inputs: [],
        name: 'ZeroAddress',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint8',
                name: 'version',
                type: 'uint8',
            },
        ],
        name: 'Initialized',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
            {
                indexed: false,
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
            {
                indexed: false,
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes',
            },
        ],
        name: 'MessageFailed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Paused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                indexed: true,
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
            {
                indexed: true,
                internalType: 'address',
                name: '_toAddress',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
        ],
        name: 'ReceiveFromChain',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: '_sender',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                indexed: true,
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
        ],
        name: 'SendToChain',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                indexed: false,
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
        ],
        name: 'SetTrustedRemote',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Unpaused',
        type: 'event',
    },
    {
        inputs: [],
        name: 'EXTRA_GAS',
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
        name: 'PT_SEND',
        outputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'allowance',
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
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'balanceOf',
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
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'canonicalToken',
        outputs: [
            {
                internalType: 'contract IAgTokenSideChainMultiBridge',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'subtractedValue',
                type: 'uint256',
            },
        ],
        name: 'decreaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'bool',
                name: '_useZro',
                type: 'bool',
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes',
            },
        ],
        name: 'estimateSendFee',
        outputs: [
            {
                internalType: 'uint256',
                name: 'nativeFee',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'zroFee',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes',
            },
            {
                internalType: 'uint64',
                name: '',
                type: 'uint64',
            },
        ],
        name: 'failedMessages',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
        ],
        name: 'forceResumeReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: '_chainId',
                type: 'uint16',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_configType',
                type: 'uint256',
            },
        ],
        name: 'getConfig',
        outputs: [
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'addedValue',
                type: 'uint256',
            },
        ],
        name: 'increaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_name',
                type: 'string',
            },
            {
                internalType: 'string',
                name: '_symbol',
                type: 'string',
            },
            {
                internalType: 'address',
                name: '_lzEndpoint',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_treasury',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'initialSupply',
                type: 'uint256',
            },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
        ],
        name: 'isTrustedRemote',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lzEndpoint',
        outputs: [
            {
                internalType: 'contract ILayerZeroEndpoint',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes',
            },
        ],
        name: 'lzReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
        ],
        name: 'minDstGasLookup',
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
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes',
            },
        ],
        name: 'nonblockingLzReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: 'pause',
                type: 'bool',
            },
        ],
        name: 'pauseSendTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'precrime',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64',
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes',
            },
        ],
        name: 'retryMessage',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'address payable',
                name: '_refundAddress',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_zroPaymentAddress',
                type: 'address',
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes',
            },
        ],
        name: 'send',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'address payable',
                name: '_refundAddress',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_zroPaymentAddress',
                type: 'address',
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes',
            },
        ],
        name: 'sendCredit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'address payable',
                name: '_refundAddress',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_zroPaymentAddress',
                type: 'address',
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
            },
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
        ],
        name: 'sendWithPermit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: '_chainId',
                type: 'uint16',
            },
            {
                internalType: 'uint256',
                name: '_configType',
                type: 'uint256',
            },
            {
                internalType: 'bytes',
                name: '_config',
                type: 'bytes',
            },
        ],
        name: 'setConfig',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'uint16',
                name: '_packetType',
                type: 'uint16',
            },
            {
                internalType: 'uint256',
                name: '_minGas',
                type: 'uint256',
            },
        ],
        name: 'setMinDstGas',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_precrime',
                type: 'address',
            },
        ],
        name: 'setPrecrime',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16',
            },
        ],
        name: 'setReceiveVersion',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16',
            },
        ],
        name: 'setSendVersion',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16',
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes',
            },
        ],
        name: 'setTrustedRemote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint8',
                name: '_useCustomAdapterParams',
                type: 'uint8',
            },
        ],
        name: 'setUseCustomAdapterParams',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'setupAllowance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceId',
                type: 'bytes4',
            },
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
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
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'treasury',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
        ],
        name: 'trustedRemoteLookup',
        outputs: [
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'useCustomAdapterParams',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address',
            },
        ],
        name: 'withdraw',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountMinted',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;
