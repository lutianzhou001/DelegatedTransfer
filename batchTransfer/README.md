# On-chain EIP712 verifier and batcher

## Run
```shell
# start the hardhat node
npx hardhat node
# deploy the smart contract
npx hardhat run scripts/deploy.tx --network localhost
# start the "frontend"
npx hardhat run scripts/operations/index.ts --network localhost
```

## function1: Generate EIP712 signature and send to the relayer
first choose the token you want to transfer.
second choose the address you want to send to.
at last choose the amount you want to transfer.

then the program will sign a EIP for you and send it to the relayer.

## function2: Choose the signer
choose the signer(there are 20 default signers in the program) and choose which signer you want to use.