import { CronJob } from 'cron';
import config from "./config.js";
import dotenv from "dotenv";
dotenv.config();
import { 
    initMegaBetTokenContract, 
    updateWhitelistsToDatabase
} from './model/megabet_token.js';
import { 
    initMegaBetMainContract,
    getLockStatus,
    lockMainContract, 
    unlockMainContract,
    finalizeBetSession,
    getNumBetSessions,
    dealtWithPlayersInSession,
    getNumPlayersByBetSessionId,
    getNumDealtWithPlayersByBetSessionId
} from './model/megabet_main.js';
import { 
    initChainLinkGenerateRandomNumberContract, 
    generateLotteryResult,
    updateLotteryResultsToDatabase
} from '../megabet_random_number/model/chainlink_generate_random_number.js';
import { delay } from '../megabet_core/helper.js';

const scanWhitelistsHandler = async () => {
    console.log('Start Scan All Whitelists Process');
    await updateWhitelistsToDatabase();
    console.log('End Scan All Whitelists Process');
}

const lockMainContractHandler = async () => {
    console.log('Start Lock Contract Process');
    await lockMainContract();
    console.log('End Lock Contract Process');
}

const unlockMainContractHandler = async () => {
    console.log('Start Lock Contract Process');
    await unlockMainContract();
    console.log('End Lock Contract Process');
}

const finalizeBetSessionHandler = async (betSessionId) => {
    console.log('Start Finalize Bet Session Process');
    await finalizeBetSession(betSessionId);
    console.log('End Finalize Bet Session Process');
}

const generateLotteryResultsHandler = async (betSessionId) => {
    console.log('Start Generate Lottery Results Process');
    // Genereate numbers for GMode
    for (let i = 1; i <= 26; i++) {
        await generateLotteryResult(betSessionId, false);
        console.log('Generate G Lottery Result Process');
        await delay(5000);
    }
    // Genereate a number for SMode
    await delay(5000);
    await generateLotteryResult(betSessionId, true);
    console.log('Generate S Lottery Result Process');
    console.log('End Generate Lottery Results Process');
}

const updateLotteryResultsToDatabaseHandler = async (betSessionId) => {
    await updateLotteryResultsToDatabase(betSessionId);
}

const dealtWithPlayersInSessionHandler = async (betSessionId) => {
    console.log('Start Dealt With In Session Process');
    const batchNumPlayersConfig = config[DEPLOY_MODE].cron_jobs.megabet_main.dealt_with_in_session_cron.batch_num_players;
    do {
        let totalPlayers = await getNumPlayersByBetSessionId(betSessionId);
        let totalDealtWithPlayers = await getNumDealtWithPlayersByBetSessionId(betSessionId);
        let totalRemainingPlayers = totalPlayers.sub(totalDealtWithPlayers);
        let batchNumPlayers = (totalRemainingPlayers.lte(batchNumPlayersConfig)) ? totalRemainingPlayers.toNumber() : batchNumPlayersConfig;
        await dealtWithPlayersInSession(betSessionId, batchNumPlayers);
        await delay(3000);
    } while (totalRemainingPlayers.gt(0));
    console.log('End Dealt With In Session Process');
}

const scanWhitelistCronJob = async () => {
    await initMegaBetTokenContract();
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    if (config[DEPLOY_MODE].cron_jobs.megabet_token.scan_whitelists_cron.status) {
        const job = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_token.scan_whitelists_cron.cron_time,
            scanWhitelistsHandler,
            null,
            true,
            'America/Los_Angeles'
        );
        job.start();
    } else {
        return null;
    }
}

const finalizeBetSessionCronJob = async () => {
    await initChainLinkGenerateRandomNumberContract();
    await initMegaBetMainContract();
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    const betSessionId = await getNumBetSessions();
    //Step 1: Lock Main Contract
    if (config[DEPLOY_MODE].cron_jobs.megabet_main.lock_main_contract_cron.status) {
        const lockMainContractJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.lock_main_contract_cron.cron_time,
            lockMainContractHandler,
            null,
            true,
            'Asia/Bangkok'
        );
        lockMainContractJob.start();
    }
    const lockStatusMegaBetMainContract = await getLockStatus();
    //Step 2: Generate Lottery Results and Add Lottery Results to Queues
    if (lockStatusMegaBetMainContract && config[DEPLOY_MODE].cron_jobs.megabet_main.generate_lottery_results_cron.status) {
        const generateLotteryResultsJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.generate_lottery_results_cron.cron_time,
            generateLotteryResultsHandler(betSessionId),
            null,
            true,
            'Asia/Bangkok'
        );
        generateLotteryResultsJob.start();
    }
    //Step 3: Update Lottery Results to Database
    if (lockStatusMegaBetMainContract && config[DEPLOY_MODE].cron_jobs.megabet_main.update_lottery_results_to_database_cron.status) {
        const updateLotteryResultsToDatabaseJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.update_lottery_results_to_database_cron.cron_time,
            updateLotteryResultsToDatabaseHandler(betSessionId),
            null,
            true,
            'Asia/Bangkok'
        );
        updateLotteryResultsToDatabaseJob.start();
    }
    //Step 4: Finilize Bet Session and save data to database
    if (lockStatusMegaBetMainContract && config[DEPLOY_MODE].cron_jobs.megabet_main.finalize_bet_session_cron.status) {
        const finalizeBetSessionJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.finalize_bet_session_cron.cron_time,
            finalizeBetSessionHandler(betSessionId),
            null,
            true,
            'Asia/Bangkok'
        );
        finalizeBetSessionJob.start();
    }
    //Step 5: Dealt with player in bet session
    if (lockStatusMegaBetMainContract && config[DEPLOY_MODE].cron_jobs.megabet_main.dealt_with_in_session_cron.status) {
        const dealtWithInSessionJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.dealt_with_in_session_cron.cron_time,
            dealtWithPlayersInSessionHandler(betSessionId),
            null,
            true,
            'Asia/Bangkok'
        );
        dealtWithInSessionJob.start();
    }
    //Step 6: Unlock Main Contract
    if (lockStatusMegaBetMainContract && config[DEPLOY_MODE].cron_jobs.megabet_main.unlock_main_contract_cron.status) {
        const unlockMainContractJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.unlock_main_contract_cron.cron_time,
            unlockMainContractHandler,
            null,
            true,
            'Asia/Bangkok'
        );
        unlockMainContractJob.start();
    }
}

export {scanWhitelistCronJob, finalizeBetSessionCronJob};