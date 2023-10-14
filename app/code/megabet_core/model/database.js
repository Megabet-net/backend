import mongoose from 'mongoose';

const WhitelistSchema = new mongoose.Schema({
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

const WhitelistModel = mongoose.model('WhitelistModel', WhitelistSchema);

export { WhitelistModel }
