import { IBridgeRange, IDelayRange, IFixedRange, IOkx } from './data/utils/interfaces';

export class OkxAuth {
    public static readonly okxApiKey: string = ''; // ясно что это
    public static readonly okxApiSecret: string = ''; // ясно что это
    public static readonly okxApiPassword: string = ''; // ясно что это из env подтягивтаь потом
}

export class TelegramData {
    public static readonly telegramBotId: string = ''; // айди телеграм бота, которому будут отправляться логи
    public static readonly telegramId: string = ''; // телеграм айди @my_id_bot у него можно получить id
}

export class OkxData {
    public static readonly isUse: boolean = false; // использовать ли Okx в софте
    public static readonly bridgeData: IOkx[] = [
        // {
        //     okxFee: '0.1',
        //     chainName: 'METIS-Polygon',
        //     networkName: 'Polygon',
        //     tokenName: 'MATIC',
        //     withdraw: { minRange: 1.1, maxRange: 1.7 },
        //     randomFixed: { minRange: 2, maxRange: 7 }, // настройку продумать потом с layer3
        //     withdrawStart: '0.5',
        // },
        // {
        //     okxFee: '0.01',
        //     chainName: 'GLMR-Moonbeam',
        //     networkName: 'Moonbeam',
        //     tokenName: 'GLMR',
        //     withdraw: { minRange: 0.15, maxRange: 0.3 },
        //     randomFixed: { minRange: 2, maxRange: 4 },
        //     withdrawStart: '0',
        // },
        {
            okxFee: '0.8',
            chainName: 'USDC-Polygon (Bridged)',
            networkName: 'Polygon (Bridged)',
            tokenName: 'USDC',
            withdraw: { minRange: 15, maxRange: 20 },
            randomFixed: { minRange: 2, maxRange: 7 }, // настройку продумать потом с layer3
            withdrawStart: '0.5',
        },
    ];

    public static readonly delayAfterWithdraw: IBridgeRange = { minRange: 1, maxRange: 2 }; // сколько ожидать времени (в минутах) после вывода с окекса
}

export class Config {
    public static readonly IsShuffleWallets: boolean = false; // перемешивать ли строки в текстовом файле для приватных ключей
    public static readonly IsShuffleSubaccs: boolean = false; // перемешивать ли субсчета в текстовом файле
    public static readonly IsUseSubaccs: boolean = true; // если использовать субакки, то бабки будут выводиться на субакки после прогона(англбридж)
    public static readonly IsLoadState: boolean = false; // загружать ли текущее состояние работы из базы данных
    public static readonly modulesCount: IBridgeRange = { minRange: 1, maxRange: 1 }; // сколько будет модулей выполнено на аккаунте
    public static readonly retryCount: number = 5; // сколько попыток будет, чтобы получить новую сеть, значение для бриджа
    public static readonly delayBetweenAction: IDelayRange = { minRange: 1, maxRange: 5 }; // задержка между действиями (в секундах) в случае ошибки
    public static readonly delayBetweenAccounts: IDelayRange = { minRange: 5, maxRange: 10 }; // задержка между аккаунтами (в минутах)
    public static readonly delayBetweenModules: IDelayRange = { minRange: 0.5, maxRange: 1.5 }; // задержка между модулями (в минутах)
    public static readonly findReceiverChainL2Pass: number = 10; // сколько попыток будет чтобы найти сеть получателя нфт в L2Pass
    public static readonly rpcs = [
        { chain: 'fantom', rpcUrl: 'https://rpc.ankr.com/fantom', id: 112 },
        { chain: 'moonbeam', rpcUrl: null, id: 126 },
        { chain: 'moonriver', rpcUrl: null, id: 167 },
        { chain: 'meter', rpcUrl: null, id: 176 },
        { chain: 'tenet-mainnet', rpcUrl: null, id: 173 },
        { chain: 'canto', rpcUrl: null, id: 159 },
        { chain: 'arbitrum-nova', rpcUrl: null, id: 175 },
        { chain: 'dfk', rpcUrl: null, id: 115 },
        { chain: 'kava-mainnet', rpcUrl: 'https://kava-pokt.nodies.app', id: 177 },
        { chain: 'andromeda', rpcUrl: null, id: 151 }, //это metis
        { chain: 'celo', rpcUrl: null, id: 125 },
        { chain: 'gnosis', rpcUrl: 'https://rpc.ankr.com/gnosis', id: 145 },
        { chain: 'klaytn', rpcUrl: 'https://klaytn.drpc.org', id: 150 },
        { chain: 'cfx-espace', rpcUrl: 'https://evm.confluxrpc.com', id: 212 }, //conflux
        { chain: 'fuse', rpcUrl: null, id: 138 },
        { chain: 'coreDao', rpcUrl: 'https://rpc.ankr.com/core', id: 153 },
        { chain: 'matic', rpcUrl: null, id: 109 }, // polygon
        { chain: 'astar-mainnet', rpcUrl: null, id: 210 },
        { chain: 'telos', rpcUrl: null, id: 199 },
        { chain: 'mantle', rpcUrl: null, id: 181 },
        { chain: 'optimism', rpcUrl: 'https://rpc.ankr.com/optimism', id: 111 },
        { chain: 'bnb', rpcUrl: null, id: 102 },
        { chain: 'base', rpcUrl: null, id: 184 },
        { chain: 'arbitrum', rpcUrl: null, id: 110 },
        { chain: 'aurora', rpcUrl: null, id: 211 },
        { chain: 'avalanche', rpcUrl: 'https://rpc.ankr.com/avalanche', id: 106 },
    ];
}

export class MerklyData {
    // range = [мин. значение бриджа, макс. значение бриджа], fixed = [мин.кол-во знаков после запятой, макс.кол-во знаков после запятой]
    public static readonly isUse: boolean = true; // использовать ли Merkly в софте
    public static readonly values: { [key: string]: { range: IBridgeRange; fixed: IFixedRange } } = {
        // 'Fantom,Moonbeam': { range: { minRange: 0.1, maxRange: 0.5 }, fixed: { minRange: 1, maxRange: 5 } }, // 0.32$ (макс 6 = 2.39$)
        // 'Fantom,Moonriver': { range: { minRange: 0.003, maxRange: 0.03 }, fixed: { minRange: 3, maxRange: 6 } }, //0.34$ (макс 0.05 - 0.51$)
        // 'Fantom,Meter': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.24$
        // 'Fantom,Tenet': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.39$
        // 'Fantom,Canto': { range: { minRange: 0.1, maxRange: 0.98 }, fixed: { minRange: 1, maxRange: 5 } }, //0.56$
        // //'Fantom,Arbitrum Nova': 0.02, // подумать т.к это 48$
        // 'Fantom,DFK Chain': { range: { minRange: 0.1, maxRange: 1 }, fixed: { minRange: 1, maxRange: 5 } }, //0.49$ (макс 6 - 2.64$)
        // 'Fantom,Kava EVM': { range: { minRange: 0.05, maxRange: 0.3 }, fixed: { minRange: 2, maxRange: 6 } }, //0.33$ (макс 0.98 - 1$)
        // 'Fantom,Metis': { range: { minRange: 0.001, maxRange: 0.005 }, fixed: { minRange: 3, maxRange: 7 } }, //0.46$ (макс 0.05 - 1.78$)
        // 'Fantom,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 7 } }, //0.09$
        // 'Fantom,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.11$
        'Klaytn,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 7 } }, //0.11$
        'Klaytn,DFK Chain': { range: { minRange: 0.2, maxRange: 1 }, fixed: { minRange: 2, maxRange: 6 } }, //0.49$ (макс 6 - 2.61$)
        'Klaytn,Metis': { range: { minRange: 0.001, maxRange: 0.005 }, fixed: { minRange: 3, maxRange: 6 } }, //0.3$ (макс 0.05 - 3$)
        'Klaytn,Fuse': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.05$
        'Celo,Fuse': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05$
        'Celo,Moonbeam': { range: { minRange: 0.05, maxRange: 0.5 }, fixed: { minRange: 2, maxRange: 5 } }, //0.32$ (макс 6 = 2.35$)
        'Celo,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12$
        'DFK Chain,Moonbeam': { range: { minRange: 0.1, maxRange: 0.5 }, fixed: { minRange: 1, maxRange: 5 } }, //0.32$ (макс 6 = 2.2$)
        'DFK Chain,Klaytn': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.07$
        'DFK Chain,Harmony One': { range: { minRange: 0.01, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 5 } }, //0.1$
        'Conflux eSpace,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, //0.09$
        'Metis,Klaytn': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.16$
        'Metis,Meter': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.32$
        'Metis,Fuse': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.14$
        'Metis,Canto': { range: { minRange: 0.1, maxRange: 0.35 }, fixed: { minRange: 1, maxRange: 5 } }, // 0.3$ (макс 0.98 - 0.69$)
        'Metis,Tenet': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.45$
        'Metis,Kava EVM': { range: { minRange: 0.05, maxRange: 0.3 }, fixed: { minRange: 2, maxRange: 7 } }, // 0.35$ (макс 0.98 - 1.01$)
        'Metis,Moonriver': { range: { minRange: 0.005, maxRange: 0.02 }, fixed: { minRange: 3, maxRange: 5 } }, // 0.23$ (макс 0.05 - 0.53$)
        'Metis,Mantle': { range: { minRange: 0.02, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.3$ (макс 0.2 - 0.61$)
        'Metis,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.21$
        // 'Polygon,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.23$
        // 'Polygon,Celo': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.09$
        // 'Polygon,Klaytn': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.07$
        // 'Polygon,Moonriver': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.46$
        // 'Polygon,Core Dao': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.23$
        // 'Polygon,Kava EVM': { range: { minRange: 0.1, maxRange: 0.37 }, fixed: { minRange: 1, maxRange: 4 } }, // 0.37$ (макс 0.98 - 0.95$)
        // 'Polygon,Astar': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.18$
        // 'Polygon,Telos': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.38$
        'Moonbeam,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.10$
        'Moonbeam,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.12$
        'Moonbeam,DFK Chain': { range: { minRange: 0.01, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.1$
        'Moonbeam,Harmony One': { range: { minRange: 0.01, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.1$
        'Gnosis,Celo': { range: { minRange: 0.6, maxRange: 0.7 }, fixed: { minRange: 2, maxRange: 6 } }, // макс 1 - 0.82$
    };
}

export class L2PassConfig {
    public static readonly isUseBridgeNFT: boolean = false; // использовать ли в L2Pass bridge NFT
    public static readonly isUseGasRefuel: boolean = true; // использовать ли в L2Pass gas Refuel
    public static readonly paths = [
        'Fantom,Gnosis',
        'Fantom,Moonbeam',
        'Fantom,Moonrriver',
        'Fantom,Celo',
        'Fantom,Kava EVM',
        'Polygon,Gnosis',
        'Polygon,Moonbeam',
        'Polygon,Moonriver',
        'Polygon,Celo',
        'Polygon,Kava EVM',
        'Polygon,Fuse',
        'Moonbeam,Gnosis',
        'Moonbeam,Celo',
        'Moonriver,Kava EVM',
        'Celo,Moonbeam',
        'Celo,Fuse',
        'Celo,Gnosis',
        'Kava EVM,Moonriver',
    ];
    public static readonly values: { [key: string]: { range: IBridgeRange; fixed: IFixedRange } } = {
        // 'Fantom,Moonbeam': { range: { minRange: 0.01, maxRange: 0.5 }, fixed: { minRange: 1, maxRange: 5 } }, // 0.32$ (макс 6 = 2.39$)
        // 'Fantom,Moonriver': { range: { minRange: 0.003, maxRange: 0.01 }, fixed: { minRange: 3, maxRange: 6 } }, //0.36$ (макс 0.05 - 0.51$)
        // 'Fantom,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 7 } }, //0.09$
        // 'Fantom,Kava EVM': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, //0.33$ (макс 0.98 - 1$)
        // 'Fantom,Canto': { range: { minRange: 0.1, maxRange: 0.35 }, fixed: { minRange: 1, maxRange: 5 } }, // 0.3$ (макс 0.98 - 0.69$)
        // 'Fantom,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.11$
        // 'Fantom,Harmony One': { range: { minRange: 0.01, maxRange: 0.5 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.1$
        'Klaytn,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 7 } }, //0.11$
        'Klaytn,Fuse': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.05$
        'Celo,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12$
        'Celo,Moonbeam': { range: { minRange: 0.05, maxRange: 0.3 }, fixed: { minRange: 2, maxRange: 5 } }, //0.23$ (макс 6 = 2.35$)
        'Celo,Fuse': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05$
        // 'Polygon,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.23$
        // 'Polygon,Celo': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.09$
        // 'Polygon,Klaytn': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.07$
        // 'Polygon,Moonriver': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.46$
        // 'Polygon,Core Dao': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.23$
        // 'Polygon,Kava EVM': { range: { minRange: 0.1, maxRange: 0.37 }, fixed: { minRange: 1, maxRange: 4 } }, // 0.37$ (макс 0.98 - 0.95$)
        'Moonbeam,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.10$
        'Moonbeam,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.12$
        'Moonbeam,Harmony One': { range: { minRange: 0.01, maxRange: 0.15 }, fixed: { minRange: 2, maxRange: 6 } }, // 0.1$
        'Gnosis,Celo': { range: { minRange: 0.6, maxRange: 0.7 }, fixed: { minRange: 2, maxRange: 6 } }, // макс 1 - 0.82$
    };
}

export class AngleBridgeConfig {
    public static readonly isUse: boolean = true; // использовать ли angle bridge в софте
    public static readonly circlesCount: number = 0; // сколько раз будет бридж celo<->gnosis
    public static readonly swapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 15, maxRange: 15.8 },
        fixed: { minRange: 1, maxRange: 4 },
    }; // сколько usdc будет свапнуто в agEURAbi и нужно понимать, что на 0.92 меньше в бридже, из-за конвертации
    public static readonly bridgeRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 17.5, maxRange: 18.5 },
        fixed: { minRange: 1, maxRange: 4 },
    }; // сколько agEURAbi будет забриджено
    public static readonly delayWithPolygon: IDelayRange = { minRange: 23, maxRange: 25 }; // задержка между действиями (в минутах) при бриджах в полигоне(от 20 минут)
    public static readonly delayWithNonPolygon: IDelayRange = { minRange: 2.5, maxRange: 5 }; // задержка между действиями (в минутах) при бриджах гнозис/cело и свапах
    public static readonly bridgePolygonLimit: { limit: number; range: IBridgeRange; fixed: IFixedRange } = {
        limit: 0.45,
        range: { minRange: 2, maxRange: 3.5 },
        fixed: { minRange: 2, maxRange: 6 },
    }; // ниже какой суммы будет выводиться matic с биржи
    public static readonly bridgeCeloLimit: { limit: number; range: IBridgeRange; fixed: IFixedRange } = {
        limit: 0.6,
        range: { minRange: 1.1, maxRange: 2 },
        fixed: { minRange: 2, maxRange: 6 },
    }; // ниже какой суммы будет выводиться celo с биржы/покупаться за gnosis и сколько
    public static readonly bridgeGnosisLimit: { limit: number; range: IBridgeRange; fixed: IFixedRange } = {
        limit: 0.4,
        range: { minRange: 1.1, maxRange: 2 },
        fixed: { minRange: 2, maxRange: 6 },
    }; // ниже какой суммы будет покупаться gnosis(пока что ток за polygn на layer3) и сколько
    public static readonly bridgeDataPolygon: IOkx[] = [
        {
            okxFee: '0.1',
            chainName: 'METIS-Polygon',
            networkName: 'Polygon',
            tokenName: 'MATIC',
            withdraw: { minRange: 1.1, maxRange: 1.7 },
            randomFixed: { minRange: 2, maxRange: 7 },
            withdrawStart: '0.5',
        },
    ]; // сколкьо будет выводиться matic
    public static readonly bridgeDataCelo: IOkx[] = [
        {
            okxFee: '0.1',
            chainName: 'CELO-CELO',
            networkName: 'CELO',
            tokenName: 'CELO',
            withdraw: { minRange: 1.1, maxRange: 1.7 },
            randomFixed: { minRange: 2, maxRange: 7 },
            withdrawStart: '0.5',
        },
    ]; // сколкьо будет выводиться celo в случае если выпадет рандомно для пополенение биржа, а не gaszip/l2pass, минималка 1
}

export class StargateConfig {
    public static readonly isUse: boolean = false; // использовать ли stargateAbi в софте
    public static readonly stgAmount: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.1, maxRange: 0.2 },
        fixed: { minRange: 3, maxRange: 6 },
    }; // сколько matic'a будет потрачено на покупку stg
    public static readonly bridgePercent: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 3, maxRange: 6 },
        fixed: { minRange: 3, maxRange: 8 },
    }; // сколько процентов от имеющегося кол-ва stg бриджить за раз
}

export class L2Telegraph {
    // range = [мин. значение бриджа, макс. значение бриджа], fixed = [мин.кол-во знаков после запятой, макс.кол-во знаков после запятой]
    public static readonly isUseRefuel: boolean = true; // использовать ли refuel в софте
    public static readonly isUseSendMessage: boolean = true; // использовать ли отправку сообщений в софте
    public static readonly values: { [key: string]: { range: IBridgeRange; fixed: IFixedRange } } = {
        'Celo,Fuse': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05$
        'Celo,Moonbeam': { range: { minRange: 0.01, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 5 } }, //0.32$ (макс 1 = 2.35$)
        'Celo,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12$
        // 'Polygon,Gnosis': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.23$
        // 'Polygon,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, // 0.09$
        // 'Polygon,Klaytn': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.07$
        // 'Polygon,Shimmer': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, // 0.06$
        // 'Polygon,Moonbeam': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 6 } }, //(макс 1 - 0.6$) 0.1$
        // 'Polygon,Kava EVM': { range: { minRange: 0.1, maxRange: 0.37 }, fixed: { minRange: 1, maxRange: 4 } }, // 0.37$ (макс 1 - 0.95$)
        // 'Polygon,Fuse': { range: { minRange: 0.1, maxRange: 0.37 }, fixed: { minRange: 1, maxRange: 4 } }, // 0.07$ (макс 1 - 0.95$)
        'Gnosis,Klaytn': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12$
        'Gnosis,Moonbeam': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12 (макс 1 - $)
        'Gnosis,Fuse': { range: { minRange: 0.01, maxRange: 0.1 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12 (макс 1 - $)
        'Gnosis,Celo': { range: { minRange: 0.01, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 4 } }, //0.12
    };
}

export class DefiKingdom {
    public static readonly isUse: boolean = false; // использовать ли Defi Kingdom в софте
    public static readonly sellJewelRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.003, maxRange: 0.01 },
        fixed: { minRange: 3, maxRange: 6 },
    }; // сколько jewel будет потрачено на покупку DFKGOLD
    public static readonly dfkGoldBridgeRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 1.3, maxRange: 5.4 },
        fixed: { minRange: 2, maxRange: 3 },
    }; // сколько DFKGOLD будет забриджено за раз, больше 3 fixed ставить нельзя
    public static readonly bridgeRangePerModule: IBridgeRange = { minRange: 5, maxRange: 7 }; // сколько будет сделано бриджей за 1 модуль
    public static readonly delayBetweenBridge: IDelayRange = { minRange: 0.3, maxRange: 0.5 }; // задержка между бриджами DFKGOLD
}

export class GasZipConfig {
    public static readonly isUse: boolean = true; // использовать ли Gas Zip в софте
    public static readonly chainAmount: IFixedRange = { minRange: 2, maxRange: 3 }; // сколько сетей получателей будет
    public static readonly values: { [key: string]: { range: IBridgeRange; fixed: IFixedRange } } = {
        fantom: { range: { minRange: 0.02, maxRange: 2 }, fixed: { minRange: 2, maxRange: 5 } }, //631 max
        moonbeam: { range: { minRange: 0.02, maxRange: 0.5 }, fixed: { minRange: 2, maxRange: 5 } }, //10 max
        moonriver: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // 'tenet-mainnet': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // 'arbitrum-nova': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // 'kava-mainnet': { range: { minRange: 0.02, maxRange: 0.5 }, fixed: { minRange: 2, maxRange: 5 } }, //1 max
        // andromeda: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //1 max
        // celo: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // gnosis: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // klaytn: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // 'cfx-espace': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // fuse: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // coreDao: { range: { minRange: 0.02, maxRange: 0.25 }, fixed: { minRange: 2, maxRange: 5 } }, //0.25 max
        // matic: { range: { minRange: 0.02, maxRange: 0.524 }, fixed: { minRange: 2, maxRange: 5 } }, //631 max
        // 'astar-mainnet': { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        // telos: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //1 max
        // mantle: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //10 max
        // optimism: { range: { minRange: 0.02, maxRange: 0.05 }, fixed: { minRange: 2, maxRange: 5 } }, //0.24 max
        // bnb: { range: { minRange: 0.00002, maxRange: 0.0000005 }, fixed: { minRange: 6, maxRange: 10 } }, //1.32 max
        // base: { range: { minRange: 0.000001, maxRange: 0.05 }, fixed: { minRange: 7, maxRange: 12 } }, //0.05 max
        // arbitrum: { range: { minRange: 0.0000005, maxRange: 0.00000024 }, fixed: { minRange: 7, maxRange: 12 } }, //0.24 max
        // aurora: { range: { minRange: 0.000002, maxRange: 0.000005 }, fixed: { minRange: 2, maxRange: 5 } }, //0.05 max
        avalanche: { range: { minRange: 0.1, maxRange: 0.3 }, fixed: { minRange: 2, maxRange: 5 } }, //18.47 max
    };
}

export class Layer3Config {
    public static readonly isUse: boolean = true; // использовать ли Layer3 bridge в софте
    // используется только для angle bridge
    public static readonly bridgeRangePolygon: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 1.1, maxRange: 2 },
        fixed: { minRange: 2, maxRange: 6 },
    };
    public static readonly bridgeRangeBsc: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.003, maxRange: 0.004 },
        fixed: { minRange: 3, maxRange: 6 },
    };
    public static readonly bridgeRangeAvalanche: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.03, maxRange: 0.045 },
        fixed: { minRange: 2, maxRange: 5 },
    };
    // пока что матик юзается, сколько бриджить матика в gnosis, надо ставить в конфиге okx на вывод матика еще сразу, от 1.1 сатвить
}
