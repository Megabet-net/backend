import { CronJob } from 'cron';
import config from "./config.js";
import dotenv from "dotenv";
dotenv.config();
import { initMegaBetTokenContract, updateWhitelistsToDatabase} from './model/megabet_token.js';
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

const generateLotteryResultsHandler = async () => {
    const betSessionId = 1;
    for (let i = 1; i <= 27; i++) {
        await generateLotteryResult(betSessionId);
        await delay(5000);
    }
}

const updateLotteryResultsToDatabaseHandler = async () => {
    const betSessionId = 1;
    await updateLotteryResultsToDatabase(betSessionId);
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
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    //Step 1: Lock Main Contract
    //Step 2: Generate Lottery Results and Add Lottery Results to Queues
    //TODO: Check Main Contract Lock
    if (config[DEPLOY_MODE].cron_jobs.megabet_main.generate_lottery_results_cron.status) {
        const generateLotteryResultsJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.generate_lottery_results_cron.cron_time,
            generateLotteryResultsHandler,
            null,
            true,
            'Asia/Bangkok'
        );
        generateLotteryResultsJob.start();
    }
    //Step 3: Update Lottery Results to Database
    if (config[DEPLOY_MODE].cron_jobs.megabet_main.update_lottery_results_to_database_cron.status) {
        console.log('update_lottery_results_to_database_cron');
        const updateLotteryResultsToDatabaseJob = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.update_lottery_results_to_database_cron.cron_time,
            updateLotteryResultsToDatabaseHandler,
            null,
            true,
            'Asia/Bangkok'
        );
        updateLotteryResultsToDatabaseJob.start();
    }
    //Step 4: Unlock Main Contract
}

export {scanWhitelistCronJob, finalizeBetSessionCronJob};