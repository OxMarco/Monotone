# Monotone
This repository aims at creating a backing dex, an AMM where the swap function is strictly monotonic: the price of the token vs the numeraire is always positive, constant or increasing but never decreasing. 
This essentially ensures that **regardless of how many people swap their token, the price is fixed and is based on the ratio between the token circulating supply and the pool numeraire balance.**
> To make an example, let's imagine the pool contains 1000 DAI as numeraire and the token is TKN, held by Alice (10 TKN), Bob (80 TKN) and Alice (10 TKN). The price of 1 TKN is 10 DAI (1000/100) and it will remain so regardless of how many people swap their TKN for DAI or viceversa.

## Use Cases
This dex is particularly useful when combining **stablecoins** and **synthetic assets** or **rwa**, as it allows the creation for a consistent backing that supports the price of the main token. Arbitrageurs can then use this dex to swap the main token for the numeraire and viceversa, ensuring that the price of the main token is always backed by the numeraire on other dexes.

An example are ETF-like tokens where the value of the token is backed by fee-earning assets so that the minimum price properly respects the fees accrued.

## Architecture
The dex is made of a single monolithic smart contract, the router, that acts as a singleton and manages the liquidity pools. The router is the only contract that can interact with the pools, while users can only interact with the router. This is done to save gas (approximately 60% compared to pool-based dexes) and to keep a minimal attack surface.

## Incentive System
One of the innovative aspects of this contract is its use of a points system to reward users leveraging Mode's SFS.
These points are earned based on the users' interactions with the contract, particularly through the computational resources (or gas) they expend.

## How to run it
The project is deployed on both Sepolia and Mode testnet and uses mock tokens:

**Mode**
* Router `0x8430490531cF86Db1580fA9CcBFCECd06BCd7DF9`
* MLINK `0x7563943E99CCf404CDBeFDD98ddE91DC52b08836`
* MUSD `0x87F3D0d1Ea8781b01Ae4e2bF99aCe343804122F3`

**Sepolia**
* Router `0x71b6e127d9DD6060d3C229E783A99a9F656baEb4`
* LINK `0x1dE9993Be1Fe26712b2C2ade4a3bA7E044591E90`
* NUSD `0xB1282B067a4D355aa4Ad6D1C7E94a788A9420eC3`

### Contracts
Install [foundry](https://book.getfoundry.sh/getting-started/installation) if you don't have it already:
```bash
curl -L https://foundry.paradigm.xyz | bash
```

Then run the tests:
```bash
forge install
forge build
forge test
```

Or, to view the callstack:
```bash
forge test -vvvv
```

### Frontend
Install dependencies and start the frontend:
```bash
npm install
npm run dev
```
