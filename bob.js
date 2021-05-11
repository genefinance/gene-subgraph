const BigNumber = require('bignumber.js')
const rp = require('request-promise')


async function doRequest(first, skip, height) {
    const options = {
        method: 'POST',
        uri: 'http://164.90.169.154:8000/subgraphs/name/genefinance/gene-finance-holders',
        body: {
            "query": `{ \n  stakes(first: ${first}, skip: ${skip} block: { number: ${height}}) { \n    id\n    pid\n    userAddr\n    computedAmount\n    amount\n rewardDebt\n }\n
} \n`, "variables": null
        },
        json: true
    };

    const res = await rp(options)
    return res.data
}

async function getAllUserBalances() {
    let i = 0
    const page = 1000
    const pool_user_stakes = {}
    const height = 12249384
    let total_count = 0
    while (true) {
        const res = await doRequest(page, i * page, height)
        ++i
        total_count = res.stakes.length
        console.log('stakes size', total_count)
        if (res.stakes.length == 0) {
            break
        }

        for (const stake of res.stakes) {
            if (pool_user_stakes[stake.pid] == undefined) {
                pool_user_stakes[stake.pid] = {}
            }

            if (pool_user_stakes[stake.pid][stake.userAddr] == undefined) {
                pool_user_stakes[stake.pid][stake.userAddr] = BigNumber(0)
            }

            pool_user_stakes[stake.pid][stake.userAddr] = pool_user_stakes[stake.pid][stake.userAddr].plus(BigNumber(stake.amount))
        }

    }
    return pool_user_stakes
}

async function main() {
    const pool_user_stakes = await getAllUserBalances()
    for (const pid in pool_user_stakes) {
        const user_stakes = pool_user_stakes[pid]
        for (const user in user_stakes) {
            const stake = user_stakes[user]
            console.log(`${pid}, ${user}, ${stake}`)
        }
    }
}


main()
