import { Chain } from 'viem';
import { arbitrumNova, celo, fantom, fuse, gnosis, kava, mantle, moonbeam, moonriver, polygon } from 'viem/chains';

export class L2passConfig {
    public static chains: { [key: string]: { chain: Chain } } = {
        fantom: { chain: fantom },
        moonbeam: { chain: moonbeam },
        moonriver: { chain: moonriver },
        arbitrumNova: { chain: arbitrumNova },
        kava: { chain: kava },
        celo: { chain: celo },
        gnosis: { chain: gnosis },
        fuse: { chain: fuse },
        polygon: { chain: polygon },
        mantle: { chain: mantle },
    };
}
