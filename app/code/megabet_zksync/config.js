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
                    status: false,
                    cron_time: '* * * * * *'
                }
            },
            megabet_main: {
                lock_contract_cron: {
                    status: false,
                    cron_time: '* * * * * *'
                },
                generate_lottery_results_cron: {
                    status: false,
                    cron_time: '*/3 * * * *'
                },
                update_lottery_results_to_database_cron: {
                    status: true,
                    cron_time: '* * * * * *'
                },
                unlock_contract_cron: {
                    status: false,
                    cron_time: '* * * * * *'
                },
            }
        }
    }
}

export default config;