import { Hex, PrivateKeyAccount } from 'viem';

export async function getQuoteBody(userAddress: Hex, value: string, isFromUsdc: boolean) {
    return {
        aggregator: 'odos',
        url: 'https://api.odos.xyz/sor/quote/v2',
        body: {
            chainId: 137,
            compact: true,
            inputTokens: [
                {
                    amount: value,
                    tokenAddress: isFromUsdc
                        ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
                        : '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
                },
            ],
            outputTokens: [
                {
                    proportion: 1,
                    tokenAddress: !isFromUsdc
                        ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
                        : '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
                },
            ],
            referralCode: 4626,
            userAddr: userAddress.toLowerCase(),
            slippageLimitPercent: 1,
            pathViz: true,
            pathVizImage: true,
            pathVizImageConfig: {
                linkColors: [
                    '#fdceaa',
                    '#f4837d',
                    '#aac4fd',
                    '#e0557e',
                    '#b9aafd',
                    '#87dcc9',
                    '#fcb076',
                    '#dcd5fe',
                    '#2ac8a5',
                    '#fdaab0',
                    '#fee0ca',
                    '#fff9f4',
                    '#76a0fc',
                    '#f3bdcd',
                    '#f05a52',
                    '#da2f61',
                    '#e1f6f2',
                    '#fce0df',
                    '#dfe2eb',
                    '#c3eee4',
                    '#f9dee6',
                    '#8e76fc',
                    '#333a54',
                    '#eeeaff',
                    '#7e89af',
                    '#eb4960',
                    '#2166fa',
                    '#faf1e7',
                    '#454E71',
                    '#fefcf9',
                    '#dde7fe',
                ],
                nodeColor: '#333a54',
                nodeTextColor: '#faf1e7',
                legendTextColor: '#faf1e7',
                height: 300,
            },
        },
    };
}

export async function getSwapBody(userAddress: Hex, pathId: string) {
    return {
        aggregator: 'odos',
        body: {
            pathId: pathId,
            simulate: false,
            userAddr: userAddress.toLowerCase(),
        },
        url: 'https://api.odos.xyz/sor/assemble?',
    };
}

export function getTypedData(chainId: number, verifyingContract: Hex) {
    return {
        primaryType: 'Permit' as 'EIP712Domain' | 'Permit',
        types: {
            Permit: [
                {
                    name: 'owner',
                    type: 'address',
                },
                {
                    name: 'spender',
                    type: 'address',
                },
                {
                    name: 'value',
                    type: 'uint256',
                },
                {
                    name: 'nonce',
                    type: 'uint256',
                },
                {
                    name: 'deadline',
                    type: 'uint256',
                },
            ],
        },
        domain: {
            name: 'agEUR',
            version: '1',
            chainId: chainId,
            verifyingContract: verifyingContract,
        },
        message: {},
    };
}

export function getLimit(userAddress: Hex, chainId: number, toChainId: number) {
    return `https://api.angle.money/v1/layerZero?user=${userAddress}&chainId=${chainId}&toChainId=${toChainId}`;
}
