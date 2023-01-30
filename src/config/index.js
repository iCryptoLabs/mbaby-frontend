import {
    API_ENDPOINT,
    BASE_BSC_SCAN_URLS
} from "./constants/api";
import { CHAIN_ID } from "./constants/networks";
import { RARITY } from "./constants/rarity";
import { CONTRACTS_STORE } from "./constants/networks";
import { GAMES } from "./constants/game";

export const BASE_URL = 'https://pancakeswap.finance';
export const BASE_BSC_SCAN_URL = BASE_BSC_SCAN_URLS[CHAIN_ID];

export const ConnectorNames = {
    Injected: "injected",
    WalletConnect: "walletconnect",
    BSC: "bsc"
}

export const API = {
    ENDPOINT: API_ENDPOINT
}

export const connectorLocalStorageKey = "mbaby-connectorIdv2";
export const walletLocalStorageKey = "wallet";

export const CONTRACTS = CONTRACTS_STORE[CHAIN_ID];

export const tokensList = [
    "x-world-games",
    "starsharks",
    "mobox",
    "bomber-coin",
    "biswap"
]

export {
    GAMES,
    RARITY
}