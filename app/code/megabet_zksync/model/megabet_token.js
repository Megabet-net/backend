import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import * as MegaBetTokenContractAbi from "../contracts/megabet_token.json";
import config from "./config";
import dotenv from "dotenv";
dotenv.config();

let megaBetTokenContract;

export async function initMegaBetTokenContract() {
    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY.ZKSYNC_NETWORK || "";
    if (!PRIVATE_KEY) throw "Private key not detected! Add it to the .env file!";

    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";

    const provider = new Provider(config[DEPLOY_MODE].network.url);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    megaBetTokenContract = new ethers.Contract(
        config[DEPLOY_MODE].contract_address.megabet_token,
        MegaBetTokenContractAbi.abi,
        signer
    );
}

export async function getWhitelists() {
    if (!megaBetTokenContract) {
        return null;
    }
}
