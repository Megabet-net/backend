import { CronJob } from 'cron';
import config from "./config.js";
import dotenv from "dotenv";
dotenv.config();

const createWhitelistCronJob = async () => {
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    if (config[DEPLOY_MODE].cron_jobs.megabet_token.whitelist_cron.status) {
        const job = new CronJob(
            config[DEPLOY_MODE].cron_jobs.megabet_token.whitelist_cron.cron_time,
            function () {
                console.log('You will see this message every second');
            },
            null,
            true,
            'America/Los_Angeles'
        );
        job.start();
    } else {
        return null;
    }
}

export {createWhitelistCronJob};