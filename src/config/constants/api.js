import { CIDS } from "./networks";

export const API_ENDPOINT = "https://api.coingecko.com/api/v3";

export const BASE_BSC_SCAN_URLS = {
    [CIDS.MAINNET]: 'https://bscscan.com',
    [CIDS.TESTNET]: 'https://testnet.bscscan.com',
}