import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import MegaBetMainContractAbi from "../contracts/megabet_main.js";
import config from "../config.js";
import dotenv from "dotenv";
dotenv.config();

let megaBetMainContract;

export async function initMegaBetMainContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY_ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";

    const provider = new Provider(config[DEPLOY_MODE].network.url);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Start deploy megabet main contract');
    megaBetMainContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.megabet_main,
        MegaBetMainContractAbi.abi,
        signer
    );
}

export async function getLockStatus() {
    if (!megaBetMainContract) {
        return null;
    }
    return await megaBetMainContract._isLock();
}

export async function lockMainContract() {
    if (!megaBetMainContract) {
        return null;
    }
    const lockStatus = await getLockStatus();
    if (lockStatus == false) {
        const lockMegaBetMainContractx = await megaBetMainContract.lock();
        await lockMegaBetMainContractx.wait(2);
        console.log('Lock Main Contract Successfully');
    }
    return true;
}

export async function unlockMainContract() {
    if (!megaBetMainContract) {
        return null;
    }
    const lockStatus = await getLockStatus();
    if (lockStatus == true) {
        const unlockMegaBetMainContractx = await megaBetMainContract.unlock();
        await unlockMegaBetMainContractx.wait(2);
        console.log('Unlock Main Contract Successfully');
    }
    return true;
}
