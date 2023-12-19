#!/bin/bash

export RPC_URL=http://127.0.0.1:8545

# Actors
export DEPLOYER_PUBLIC_KEY=0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
export DEPLOYER_PRIVATE_KEY=0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

# Tokens
export USDC=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
export LINK=0x514910771AF9Ca656af840dff83E8264EcF986CA
export WHALE=0x8EB8a3b98659Cce290402893d0123abb75E3ab28
export tokens=($USDC $LINK)

# Give tokens to user
cast rpc anvil_impersonateAccount $WHALE --rpc-url=$RPC_URL
for token in "${tokens[@]}"; do
    BALANCE=$(cast call --rpc-url=$RPC_URL $token "balanceOf(address)(uint256)" $WHALE)
    cast send $token --rpc-url=$RPC_URL --unlocked --from $WHALE "transfer(address,uint256)(bool)" $DEPLOYER_PUBLIC_KEY $BALANCE
done
cast rpc anvil_stopImpersonatingAccount $WHALE --rpc-url=$RPC_URL

# Deploy contracts
MOCKREGISTRY=$(forge create src/mocks/MockRegistry.sol:MockRegistry --rpc-url=$RPC_URL --private-key=$DEPLOYER_PRIVATE_KEY)
export MOCKREGISTRY_ADDRESS=$(echo "$MOCKREGISTRY" | grep "Deployed to:" | awk '{print $3}')

ROUTER=$(forge create src/Router.sol:Router --rpc-url=$RPC_URL --private-key=$DEPLOYER_PRIVATE_KEY --constructor-args $MOCKREGISTRY_ADDRESS)
export ROUTER_ADDRESS=$(echo "$ROUTER" | grep "Deployed to:" | awk '{print $3}')

# Create pool
cast send --rpc-url=$RPC_URL --private-key=$DEPLOYER_PRIVATE_KEY $ROUTER_ADDRESS  "create(address,address)" $LINK $USDC

# Print out contract address
echo " "
echo "---------------------------------------------------------------------------"
echo "Router contract deployed to $ROUTER_ADDRESS"
echo "---------------------------------------------------------------------------"
