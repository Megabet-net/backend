import mongoose from 'mongoose';
import { scanWhitelistCronJob, finalizeBetSessionCronJob } from './app/code/megabet_zksync/cron.js';

const connectDb = () => {
    return mongoose.connect("mongodb://127.0.0.1:27017/megabet", {useNewUrlParser: true});
};

connectDb().then(async () => {
    console.log('Connected to Database');
    await scanWhitelistCronJob();
    await finalizeBetSessionCronJob();
});