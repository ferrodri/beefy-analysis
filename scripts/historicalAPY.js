// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const BeefyVaultV7ABI = require('../abi/BeefyVaultV7.json');
const { AsyncParser } = require('@json2csv/node');
const fs = require('fs');
const path = require('path');

const contractAddress = '0x6282FCa35943faBE45d6056F3751b3cf2Bf4504E';
const numOfDays = 20;


async function main() {
    // function getContractAt(abi: any[], address: string, signer?: ethers.Signer): Promise<ethers.Contract>;
    const BeefyVaultV7 = await hre.ethers.getContractAt(BeefyVaultV7ABI, contractAddress);
    const { number: latestBlock } = await hre.ethers.provider.getBlock('latest');

    /**
     * There are 7,114 blocks mined per day
     * @see{https://ycharts.com/indicators/ethereum_blocks_per_day#:~:text=Basic%20Info,8.55%25%20from%20one%20year%20ago.}
     */
    const blocksPerDay = 7114;
    const pastDays = [...Array(numOfDays).keys()];
    const historicData = [];

    for await (const pastDay of pastDays) {
        const block = latestBlock - (pastDay * blocksPerDay);
        const { timestamp } = await hre.ethers.provider.getBlock(block);
        const _timestamp = new Date(timestamp * 1000);
        const date = _timestamp.toLocaleDateString();
        const price = await BeefyVaultV7
            .getPricePerFullShare({ blockTag: block })
            .catch(err => {
                console.error('There was an error, please try with less days.', err);
            });
        if (!price) { break; }

        historicData.push({ date, price: hre.ethers.utils.formatUnits(price) });
    }

    const parser = new AsyncParser();
    const historicCSV = await parser.parse(historicData).promise();
    fs.writeFileSync(path.join(__dirname, '../csv/historicData.csv'), historicCSV, 'utf8', (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
