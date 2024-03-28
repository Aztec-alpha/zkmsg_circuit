Ref: **inspired by 0xPARC's great work: https://github.com/0xPARC/zkmessage.xyz)**

We copied most of the code of the [zkmessage front-end](https://github.com/0xPARC/zkmessage.xyz), we used it directly, 
and some Noir adaptation and modifications are made in the prove/verify/API part.

## Test noir-contracts
```
## Start the sandbox
aztec-up 0.30.1
aztec-sandbox
## Compile
cd noir-contracts
yarn compile
## Generate the contract artifact json and typescript interface
yarn codegen
## test
yarn test
```
