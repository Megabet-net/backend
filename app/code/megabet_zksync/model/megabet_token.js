import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import MegaBetTokenContractAbi from "../contracts/megabet_token.js";
import config from "../config.js";
import dotenv from "dotenv";
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
    
}

export async function getWhitelists() {
    if (!megaBetTokenContract) {
        return null;
    }
    const whitelistNums = await getWhitelistsNum();
    console.log(`WhitelistsNum ${whitelistNums}`);
    if (whitelistNums) {
        for(let i = 0; i < whitelistNums; i++) {
            
        }
    }
}
