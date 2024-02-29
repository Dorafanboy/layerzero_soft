import { fantom, klaytn, moonbeam, moonriver, polygon } from 'viem/chains';
import { Chain } from 'viem';

export class OkxConfig {
    public static readonly rpcs: { [key: string]: { chain: Chain } } = {
        Fantom: { chain: fantom },
        Polygon: { chain: polygon },
        Moonriver: { chain: moonriver },
        Klaytn: { chain: klaytn },
        Moonbeam: { chain: moonbeam },
        'Polygon (Bridged)': { chain: polygon },
        // 'andromeda': {chain: 'andromeda',}, //это metis
        // 'celo': {chain: 'celo',},
        // 'espace': {chain: 'cfx-espace',}, //conflux
        // 'coreDao': {chain: 'coreDao',},
        // 'matic': {chain: 'matic',}, // polygon
    };
}
