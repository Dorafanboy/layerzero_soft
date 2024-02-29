import { avalanche, bsc, polygon } from 'viem/chains';
import { ILayer3Data } from '../../data/utils/interfaces';
import { Layer3Config } from '../../config';

export const functionBridgeSignature = 'ad69fa4f';
export const params = '0x00000000000000000000000000000000000000000000000000000000000008c8';
export const socketContractAddress = '0x3a23F943181408EAC424116Af7b7790c94Cb97a5';

export class Layer3ConfigData {
    public static chains: { [key: string]: { data: ILayer3Data } } = {
        bsc: {
            data: {
                chain: bsc,
                functionSignature: '0x00000003',
                fixed: Layer3Config.bridgeRangeBsc.fixed,
                range: Layer3Config.bridgeRangeBsc.range,
            },
        },
        avalanche: {
            data: {
                chain: avalanche,
                functionSignature: '0x00000003',
                fixed: Layer3Config.bridgeRangeAvalanche.fixed,
                range: Layer3Config.bridgeRangeAvalanche.range,
            },
        },
        polygon: {
            data: {
                chain: polygon,
                functionSignature: '0x00000007',
                fixed: Layer3Config.bridgeRangePolygon.fixed,
                range: Layer3Config.bridgeRangePolygon.range,
            },
        },
    };
}
