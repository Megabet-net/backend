import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import MegaBetMainContractAbi from "../contracts/megabet_main.js";
import { LotteryResult } from '../../megabet_core/model/resource_model/database.js';
import config from "../config.js";
import {initShowResultSocket} from "../socket.js";
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

export async function getNumBetSessions() {
    if (!megaBetMainContract) {
        return null;
    }
    const betSessionId = await megaBetMainContract.getNumBetSessions();
    return betSessionId.toString();
}

export async function getBetSessionInformationById(betSessionId) {
    if (!megaBetMainContract) {
        return null;
    }
    return await megaBetMainContract.betSessions(betSessionId);
}

export async function finalizeBetSession(betSessionId) {
    if (!megaBetMainContract) {
        return null;
    }
    const betSessionInformation = await getBetSessionInformationById(betSessionId);
    if (betSessionInformation && betSessionInformation.status == 0) {
        const lotteryResults = await LotteryResult.find({ bet_session_id: betSessionId}).exec();
        let gModeResults = [];
        let sModeResult = 0;
        for (const lotteryResult of lotteryResults) {
            if (lotteryResult.fulfilled) {
                if (lotteryResult.is_s_mode == false) {
                    const resultsTmp = JSON.parse(lotteryResult.results);
                    gModeResults.push(...resultsTmp);
                } else if (lotteryResult.is_s_mode == true) {
                    const resultsTmp = JSON.parse(lotteryResult.results);
                    sModeResult = resultsTmp[0];
                }
            }
        }
        const finalizeBetSessionTx = await megaBetMainContract.finalizeBetSession(betSessionId, gModeResults , sModeResult);
        await finalizeBetSessionTx.wait(2);
        await initShowResultSocket(gModeResults , sModeResult);
        return true;
    } {
        return;
    }
}

export async function dealtWithPlayersInSession(betSessionId, batchNumPlayers) {
    if (!megaBetMainContract) {
        return null;
    }
    const betSessionInformation = await getBetSessionInformationById(betSessionId);
    if (betSessionInformation && betSessionInformation.status == 1) {
        const totalPlayerInBetSession = betSessionInformation.num_players;
        const totalDealtWithPlayerInBetSession = betSessionInformation.num_dealt_with_players;
        if (totalPlayerInBetSession.gt(totalDealtWithPlayerInBetSession)) {
            const dealWithPlayersInBetSessionTx = await megaBetMainContract.dealWithPlayersInBetSession(betSessionId, batchNumPlayers);
            await dealWithPlayersInBetSessionTx.wait(2);
            return true;
        }
        
    }
}

export async function getNumPlayersByBetSessionId(betSessionId) {
    if (!megaBetMainContract) {
        return null;
    }
    const betSessionInformation = await getBetSessionInformationById(betSessionId);
    return betSessionInformation.num_players;
}

export async function getNumDealtWithPlayersByBetSessionId(betSessionId) {
    if (!megaBetMainContract) {
        return null;
    }
    const betSessionInformation = await getBetSessionInformationById(betSessionId);
    return betSessionInformation.num_dealt_with_players;
}
