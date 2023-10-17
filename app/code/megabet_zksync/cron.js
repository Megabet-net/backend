import { CronJob } from 'cron';
import config from "./config.js";
import dotenv from "dotenv";
dotenv.config();
import { initMegaBetTokenContract, updateWhitelistsToDatabase} from './model/megabet_token.js';
import { initChainLinkGenerateRandomNumberContract, generateLotteryResult } from '../megabet_random_number/model/chainlink_generate_random_number.js';

const scanWhitelistsHandler = async () => {
    console.log('Start Scan All Whitelists Process');
    await updateWhitelistsToDatabase();
    console.log('End Scan All Whitelists Process');
}

const finalizeBetSessionHandler = async () => {
    const betSessionId = 1;
    console.log(`Start finalizeBetSessionHandler ${betSessionId} Process`);
    // Step 1: Lock Main Contract
    // Step 2: Generate Random Number With Bet Session Id
    await generateLotteryResult(betSessionId);
    console.log(`End finalizeBetSessionHandler ${betSessionId} Process`);
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
    if (config[DEPLOY_MODE].cron_jobs.megabet_main.finalize_bet_session_cron.status) {
        const job = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_main.finalize_bet_session_cron.cron_time,
            finalizeBetSessionHandler,
            null,
            true,
            'America/Los_Angeles'
        );
        job.start();
    } else {
        return null;
    }
}

export {scanWhitelistCronJob, finalizeBetSessionCronJob};