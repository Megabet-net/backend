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

const Whitelist = mongoose.model('Whitelist', WhitelistSchema);

export { Whitelist }
