const config = {
    testnet: {
        contract_address: {
            megabet_token: "0x2C6d48b1a11EdF39c62ED753197d12fFda2Db2E0",
            megabet_staking: "",
            megabet_main: ""
        },
        network: {
            url: "https://zksync2-testnet.zksync.dev",
            ethNetwork: "goerli",
            zksync: true,
            verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification"
        },
        cron_jobs: {
            megabet_token: {
                whitelist_cron: {
                    status: true,
                    cron_time: '* * * * * *'
                }
            }
        }
    }
}

export default config;