import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();
import * as MegaBetMainContractAbi from "./contracts/megabet_main.json";
import config from "./config";

let contract;

export async function initContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY.ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";

    const provider = new Provider(config[DEPLOY_MODE].network.url);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const megaBetMainContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.megabet_main,
        MegaBetMainContractAbi.abi,
        signer
    );
    contract = megaBetMainContract;
}

export async function finalizeBetSession(betSessionId, gModeResults, sModeResult) {
    if (!contract) {
        return null;
    }
    try {
        const tx = await contract.finalizeBetSession(betSessionId, gModeResults, sModeResult);
        await tx.wait();
    } catch (error) {
        console.log("Finalize Bet Session has some issues: ", {error});
    }
}

