require('@nomicfoundation/hardhat-toolbox');

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
