import { CronJob } from 'cron';
import config from "./config.js";
import dotenv from "dotenv";
dotenv.config();
import { initMegaBetTokenContract, getWhitelists} from './model/megabet_token.js';

const scanWhitelistsHandler = async () => {
    console.log('Start Scan All Whitelists Process');
    await getWhitelists();
    console.log('End Scan All Whitelists Process');
}

const createWhitelistCronJobs = async () => {
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

export {createWhitelistCronJobs};