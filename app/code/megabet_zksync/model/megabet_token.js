import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import MegaBetTokenContractAbi from "../contracts/megabet_token.js";
import config from "../config.js";
import dotenv from "dotenv";
import { Whitelist } from '../../megabet_core/model/resource_model/database.js';
dotenv.config();

let megaBetTokenContract;

export async function initMegaBetTokenContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY_ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";

    const provider = new Provider(config[DEPLOY_MODE].network.url);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Start deploy megabet token contract');
    megaBetTokenContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.megabet_token,
        MegaBetTokenContractAbi.abi,
        signer
    );
}

export async function getWhitelistsNum() {
    if (!megaBetTokenContract) {
        return null;
    }
    return await megaBetTokenContract.whitelistsNum();
}

export async function getWhiteListInformationById(whiteListId) {
    if (!megaBetTokenContract) {
        return null;
    }
    const whitelistAddress = await megaBetTokenContract.getWhitelistAddressById(whiteListId);
    if (whitelistAddress) {
        const whitelist = await megaBetTokenContract.getWhitelistByAddress(whitelistAddress);
    
        return {
            id: whiteListId,
            whitelistAddress: whitelistAddress,
            whitelistAmount: whitelist.whitelist_amount.toString(),
            price: whitelist.price.toString(),
        }
    } else {
        return {};
    }    
}

export async function updateWhitelistToDatabase(whitelist) {
    if (whitelist.whitelistAddress) {
        console.log('Start find Whiliset in Database');
        let whiteListFoundDB = Whitelist.findOne({address: whitelist.whitelistAddress});
        let whiteListObj = {
            id: whitelist.id,
            address: whitelist.whitelistAddress,
            amount: whitelist.whitelistAmount,
            price: whitelist.price
        }
        console.log('Whitelist Found:');
        console.log(whiteListFoundDB);
        if(!whiteListFoundDB) {
            await Whitelist.create(whiteListObj);
            console.log('Create New Whitelist Model');
        } else {
            await Whitelist.updateOne({address: whitelist.whitelistAddress}, whiteListObj);
            console.log('Update Whitelist Model');
        }
    } else {
        return;
    }
}

export async function updateWhitelistsToDatabase() {
    if (!megaBetTokenContract) {
        return null;
    }
    const whitelistNums = await getWhitelistsNum();
    console.log(`WhitelistsNum ${whitelistNums}`);
    if (whitelistNums) {
        for(let i = 0; i < whitelistNums; i++) {
            console.log(`Start getWhiteListInformationById at Id: ${i}`);
            const whitelist = await getWhiteListInformationById(i);
            console.log('Whitelist Data on chain:');
            console.log(whitelist);
            console.log(`End getWhiteListInformationById at Id: ${i}`);
            console.log(`Start updateWhitelistToDatabase at Id: ${i}`);
            if (whitelist.whitelistAddress) {
                await updateWhitelistToDatabase(whitelist);
            }
            console.log(`End updateWhitelistToDatabase at Id: ${i}`);
        }
    }
}
