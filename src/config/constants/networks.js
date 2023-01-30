export const CHAIN_ID = process.env.REACT_APP_PUBLIC_CHAIN_ID;

export const CIDS = {
    MAINNET: 56,
    TESTNET: 97
}

export const CONTRACTS_STORE = {
    [CIDS.MAINNET]: {},
    [CIDS.TESTNET]: {
        PSALE: {
            ADDRESS: "0x47837911502de0b279383fdAa2993b797ADfde14",
            ABI: require("../abi/psale.json")
        },
        TOKEN: {
            ADDRESS: "0xcdA7199222Fa34EeFD5cA04b3831D6fdC59EBeF3",
            ABI: require("../abi/token.json"),
            BEP20: require("../abi/bep20.json"),
            BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
        },
        NFT: {
            ADDRESS: "0xeA7Ff27099d6bf3Ff94Ab5c3B32312DFFa935eae",
            ABI: require("../abi/nft.json")
        },
        NSTAKE: {
            ADDRESS: "0x6E72Ec0a515584259133d69a2404ACBCbaCf5063",
            ABI: require("../abi/nstake.json")
        },
        POOL: {
            ADDRESS: "0x09BaEF882aD09D72c9854962B074Bb99F39f238A",
            ABI: require("../abi/pool.json")
        }
    }
};
