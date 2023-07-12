require('@nomicfoundation/hardhat-toolbox');
const BeefyVaultV7ABI = require('./abi/BeefyVaultV7.json');
const { AsyncParser } = require('@json2csv/node');
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-undef
task('historical-APY', 'Gets historic data from a contract')
    .addPositionalParam('contractAddress')
    .addPositionalParam('numOfDays')
    .setAction(async (taskArguments, hre) => {
        const {contractAddress, numOfDays: _numOfDays} = taskArguments;
        const numOfDays = parseInt(_numOfDays);

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
        fs.writeFileSync(path.join(__dirname, './csv/historicData.csv'), historicCSV, 'utf8', (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Historic data saved correctly into CSV');
        });
    });

module.exports = {
    solidity: '0.8.17',
    networks: {
        arbitrum: {
            url: 'https://arb-mainnet.g.alchemy.com/v2/6sa9QY1tPuq4SzJH2QSP0EPCiqbEGEO9'
        },
        mainnet: {
            url: 'https://eth-mainnet.g.alchemy.com/v2/6sa9QY1tPuq4SzJH2QSP0EPCiqbEGEO9'
        }
    }
};
