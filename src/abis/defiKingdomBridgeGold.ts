﻿export const defiKingdomBridgeGoldABI = [
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
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'item',
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
                name: 'id',
                type: 'uint256',
            },
        ],
        name: 'ERC1155Received',
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
                internalType: 'bytes32',
                name: 'identifier',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'contractAddress',
                type: 'address',
            },
        ],
        name: 'ItemMapped',
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
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'item',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'ItemReceived',
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
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
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
        name: 'FUNCTION_TYPE_SEND',
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
        name: 'NO_EXTRA_GAS',
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
                name: '_lzEndpoint',
                type: 'address',
            },
        ],
        name: '__NonblockingLzAppUpgradeable_init',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: '__NonblockingLzAppUpgradeable_init_unchained',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_id',
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
        name: 'estimateFeeSendERC1155',
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
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_id',
                type: 'uint256',
            },
        ],
        name: 'estimateFeeSendERC1155',
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
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
        ],
        name: 'estimateFeeSendERC20',
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
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16',
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
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
        name: 'estimateFeeSendERC20',
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
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes',
            },
        ],
        name: 'getGasLimit',
        outputs: [
            {
                internalType: 'uint256',
                name: 'gasLimit',
                type: 'uint256',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_lzEndpoint',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_itemMinter',
                type: 'address',
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
        inputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        name: 'itemAddresses',
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
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'itemIdentifiers',
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
        inputs: [],
        name: 'lzEndpoint',
        outputs: [
            {
                internalType: 'contract ILayerZeroEndpointUpgradeable',
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
                internalType: 'string',
                name: '_identifier',
                type: 'string',
            },
            {
                internalType: 'address',
                name: '_contractAddress',
                type: 'address',
            },
        ],
        name: 'mapItem',
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
                internalType: 'uint256',
                name: '',
                type: 'uint256',
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
        inputs: [],
        name: 'owner',
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
        inputs: [],
        name: 'pause',
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
        name: 'renounceOwnership',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_id',
                type: 'uint256',
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
        name: 'sendERC1155',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_id',
                type: 'uint256',
            },
        ],
        name: 'sendERC1155',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
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
        name: 'sendERC20',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_item',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
            },
        ],
        name: 'sendERC20',
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
                internalType: 'uint256',
                name: '_type',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_dstGasAmount',
                type: 'uint256',
            },
        ],
        name: 'setMinDstGasLookup',
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
                internalType: 'bool',
                name: '_useCustomAdapterParams',
                type: 'bool',
            },
        ],
        name: 'setUseCustomAdapterParams',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
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
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'useCustomAdapterParams',
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
] as const;
