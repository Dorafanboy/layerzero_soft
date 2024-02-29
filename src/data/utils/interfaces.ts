import { Chain, Hex, PrivateKeyAccount } from 'viem';

export interface IBridgeRange {
    readonly minRange: number;
    readonly maxRange: number;
}

export interface IFixedRange extends IBridgeRange {}

export interface IDelayRange extends IBridgeRange {}

export interface IOkx {
    readonly okxFee: string;
    readonly chainName: string;
    readonly networkName: string;
    readonly tokenName: string;
    readonly withdraw: IBridgeRange;
    readonly randomFixed: IFixedRange;
    readonly withdrawStart: string;
}

export interface IOneToOneBridgeData {
    readonly firstChainData: { chain: Chain; contract: string };
    readonly secondChainData: { chain: Chain };
    readonly value: { range: IBridgeRange; fixed: IFixedRange };
}

export interface IFunction {
    readonly func: (account: PrivateKeyAccount) => Promise<boolean>;
    readonly isUse: boolean;
    readonly addressToWithdraw?: Hex;
    readonly firstChain?: string;
    readonly secondChain?: string;
}

export interface IChainData {
    readonly v2LZid: number;
    readonly chainId: string;
    readonly valueInEther: string;
}

export interface IBridgeChainsData {
    readonly chain: Chain;
    readonly chainData: IChainData[];
    readonly chainsName: string[];
}

export interface IKeyValue {
    readonly key: string;
    readonly value: { range: IBridgeRange; fixed: IFixedRange };
}

export interface IAngleBridgeData {
    readonly chain: Chain;
    readonly address: string;
    readonly chainId?: number;
}

export interface ILayer3Data {
    readonly chain: Chain;
    readonly functionSignature: Hex;
    readonly range: IBridgeRange;
    readonly fixed: IFixedRange;
}
