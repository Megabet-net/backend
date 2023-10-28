import * as ethers from "ethers";
import ChainLinkGenerateRandomNumberAbi from "../contracts/chainlink_generate_random_number.js";
import config from "../config.js";
import dotenv from "dotenv";
import { LotteryResult, LotteryResultQueue } from '../../megabet_core/model/resource_model/database.js';
dotenv.config();

let chainLinkGenerateRandomNumberContract;

export async function initChainLinkGenerateRandomNumberContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY_ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    
    const provider = new ethers.providers.WebSocketProvider(config[DEPLOY_MODE].network.web_socket);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Start deploy chainLinkGenerateRandomNumberContract token contract');
    chainLinkGenerateRandomNumberContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.chainlink_generate_random_number,
        ChainLinkGenerateRandomNumberAbi,
        signer
    );
}

export async function generateLotteryResult(betSessionId, isSMode) {
    if (!chainLinkGenerateRandomNumberContract) {
        return null;
    }
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    const numWords = (isSMode == false) ? config[DEPLOY_MODE].number_word_per_request : 1;
    const generateLotteryResultTx = await chainLinkGenerateRandomNumberContract.requestRandomWords(
        betSessionId, 
        numWords,
        isSMode
    );
    const generateLotteryResultRes = await generateLotteryResultTx.wait(2);
    if (generateLotteryResultRes.transactionHash) {
        const lotteryResultQueue = await LotteryResultQueue.findOne({ hash: generateLotteryResultRes.transactionHash }).exec();
        if (lotteryResultQueue) {
            return;
        } else {
            LotteryResultQueue.create({
                hash: generateLotteryResultRes.transactionHash,
                block_hash: generateLotteryResultRes.blockHash,
                is_s_mode: isSMode,
                bet_session_id: betSessionId,
                num_words: numWords
            });
            console.log(`Added LotteryResultQueue: hash: ${generateLotteryResultRes.transactionHash}`);
        }
    }
}

export async function updateLotteryResultsToDatabase(betSessionId) {
    if (!chainLinkGenerateRandomNumberContract) {
        return null;
    }
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    const lotteryResultQueues = await LotteryResultQueue.find({ bet_session_id: betSessionId}).exec();
    for (const lotteryResultQueue of lotteryResultQueues) {
        if (lotteryResultQueue.block_hash) {
            const blockHash = lotteryResultQueue.block_hash;
            console.log('blockHash:', blockHash);
            const events = await chainLinkGenerateRandomNumberContract.queryFilter('RequestSent', lotteryResultQueue.block_hash);
            const {requestId, numWords} = events[0].args;
            console.log('requestId:', requestId.toString());
            const lotteryResultInfo = await getLotteryResultRequestById(requestId.toString());
            if (lotteryResultInfo.fulfilled == true) {
                let lotteryResults = [];
                for (const result of lotteryResultInfo.randomWords) {
                    lotteryResults.push(result.toString());
                }
                // Update database and remove queue
                const lotteryResult = await LotteryResult.findOne({ hash: lotteryResultQueue.hash }).exec();
                if (!lotteryResult || !lotteryResult.hash) {
                    await LotteryResult.create({
                        hash: lotteryResultQueue.hash,
                        is_s_mode: lotteryResultQueue.is_s_mode,
                        fulfilled: true,
                        bet_session_id: betSessionId,
                        results: JSON.stringify(lotteryResults)
                    });
                    await LotteryResultQueue.deleteOne({ block_hash: lotteryResultQueue.block_hash });
                }
            }
        }
    }
}

export async function getLotteryResultRequestById(requestId) {
    if (!chainLinkGenerateRandomNumberContract) {
        return null;
    }
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    return await chainLinkGenerateRandomNumberContract.getRequestStatus(requestId);
}
