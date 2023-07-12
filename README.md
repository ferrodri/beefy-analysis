# To setup the project

Set node version with `nvm use v18.12.0` and run `npm i`

# How to get historical APY from a contract

Input the command `npm run historical-APY:arbitrum contractAddres numOfDays` or `npm run historical-APY:mainnet contractAddres numOfDays` depending on the chain the vault is. 

The contract should also have 2 extra params, the first one is the vault address and the second one the number of past days we want to get historic data from.

Example: 

Get past 15 days of data from https://app.beefy.finance/vault/conic-crvusd: `npm run historical-APY:mainnet 0x6282FCa35943faBE45d6056F3751b3cf2Bf4504E 15`

Output csv can be found under `csv/historicData.csv` folder

