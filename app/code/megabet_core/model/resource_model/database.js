import mongoose from 'mongoose';

const WhitelistSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    address: {
        type: String
    },
    amount: {
        type: String
    },
    price: {
        type: String
    }
});

const LotteryResultQueueSchema = new mongoose.Schema({
    hash: {
        type: String,
        unique : true
    },
    block_hash: {
        type: String,
        unique : true
    },
    bet_session_id: {
        type: String
    },
    num_words: {
        type: Number
    }
});

const LotteryResultSchema = new mongoose.Schema({
    hash: {
        type: String
    },
    fulfilled: {
        type: Boolean
    },
    request_id: {
        type: String
    },
    bet_session_id: {
        type: String
    },
    results: {
        type: String
    }
});

const Whitelist = mongoose.model('Whitelist', WhitelistSchema);
const LotteryResult = mongoose.model('LotteryResult', LotteryResultSchema);
const LotteryResultQueue = mongoose.model('LotteryResultQueue', LotteryResultQueueSchema);
export { Whitelist, LotteryResult, LotteryResultQueue }
