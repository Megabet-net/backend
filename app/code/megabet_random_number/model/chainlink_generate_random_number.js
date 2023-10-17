import * as ethers from "ethers";
import ChainLinkGenerateRandomNumberAbi from "../contracts/chainlink_generate_random_number.js";
import config from "../config.js";
import dotenv from "dotenv";
dotenv.config();

let chainLinkGenerateRandomNumberContract;

export async function initChainLinkGenerateRandomNumberContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY_ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    
    const provider = new ethers.providers.WebSocketProvider(config[DEPLOY_MODE].network.web_socket);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Start deploy megabet token contract');
    chainLinkGenerateRandomNumberContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.chainlink_generate_random_number,
        ChainLinkGenerateRandomNumberAbi.abi,
        signer
    );
}

export async function generateLotteryResult(betSessionId) {
    if (!chainLinkGenerateRandomNumberContract) {
        return null;
    }
    const generateLotteryResultTx = await chainLinkGenerateRandomNumberContract.generateLotteryResult(betSessionId, 1);
    console.log(generateLotteryResultTx);
}
