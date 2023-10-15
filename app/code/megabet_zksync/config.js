const config = {
    testnet: {
        contract_address: {
            megabet_token: "0xd4403c156a0A2820Bf68BfA33FA74C67F306Ce13",
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
                scan_whitelists_cron: {
                    status: true,
                    cron_time: '* * * * * *'
                }
            }
        }
    }
}

export default config;