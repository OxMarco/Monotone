# Monotone
This repository aims at creating a backing dex, an AMM where the swap function is strictly monotonic: the price of the token vs the numeraire is always positive, constant or increasing but never decreasing. 
This essentially ensures that **regardless of how many people swap their token, the price is fixed and is based on the ratio between the token circulating supply and the pool numeraire balance.**
> To make an example, let's imagine the pool contains 1000 DAI as numeraire and the token is TKN, held by Alice (10 TKN), Bob (80 TKN) and Alice (10 TKN). The price of 1 TKN is 10 DAI (1000/100) and it will remain so regardless of how many people swap their TKN for DAI or viceversa.

The dex includes several key features.

1. **Liquidity Pools**: It allows for the creation and management of liquidity pools in the router contract acting as a singleton to save gas. These pools are essentially reservoirs of different types of cryptocurrencies that users can contribute to and withdraw from.

2. **Incentive System**: One of the innovative aspects of this contract is its use of a points system to reward users. These points are earned based on the users' interactions with the contract, particularly through the computational resources (or gas) they expend.

## How to run tests

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
