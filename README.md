# Circles of Angels - API

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Coverage Status](https://coveralls.io/repos/gitlab/atixlabs-oss/coa-v2/circles-of-angels-api-v2/badge.svg?branch=develop)](https://coveralls.io/gitlab/atixlabs-oss/coa-v2/circles-of-angels-api-v2?branch=develop)

Circles of Angels is a platform that brings Social Entrepreneurs and Funders around the world closer while ensuring the transparency of investments and donations through blockchain technology, which allows for traceability of operations, tracking and visualization of the real impact that entrepreneurs are generating in their communities.

## Prerequisites

- See [.nvmrc](./.nvmrc) file

- Configured PostgreSQL database

- Configured email provider account. [SendGrid](www.sengrid.com) is recommended

## Tools and frameworks

- fastify@1.14.3

- solc@0.5.8

- @nomiclabs/buidler@1.1.2

## Installation

To install and execute initial setup, please read the related documentation [Installation](docs/installation.md)


## Development

### Setup environment

- Run `npm install` to install the dependencies.
- Run `npm run node` to start a local buidler node instance in `http://localhost:8545`.
- Create the database either manually as stated above or with Docker by running `cd docker && docker-compose up -d` (this is only for the development environment!!).

### Setup smart contracts' deployment

**Smart contract deployment files**

Deployed contracts are saved in the local `state.json` file:
- This file contains the addresses of the deployed contracts per network (it's not updated for the contracts that no longer exist! Which easily happens when running a test network).
- If there's any problem with the `state.json` it can be deleted (editing it can result in inconsistencies!), though that should never be the case, it should mostly serve as clean-up.
- From this file are obtained the contracts on the backend


#### Deploy the smart contracts

If the deployment is to mainnet/testnet, this requires having the [mainnet/testnet configurations](#mainnettestnet-configuration) done.

Given a desired NETWORK:
1. If NETWORK is `develop`, then start a buidler node `npm run node`.
2. Compile the smart contracts by running `npx buidler compile`.
3. Deploy the compiled contracts to the local network by running `npx buidler deploy --network $NETWORK`.
   This will fail if the contracts were already deployed on the network, a new deployment can be forced by using `npx buidler deploy --network $NETWORK --reset-states true`.
4. If this is a mainnet/testnet deployment, make sure of saving it by running `./scripts/save-contract-deployment.sh $DEPLOYMENT_NAME`. Our recommended and use deployment names are `$DATE-$ENVIRONMENT-$COMMIT`.

#### Load mainnet/testnet deployment

Requires having the [mainnet/testnet configurations](#mainnettestnet-configuration) done.

A deployment with of a given DEPLOYMENT_NAME can be loaded by running the script `./scripts/load-contract-deployment.sh $DEPLOYMENT_NAME`.
Note that this overrides the current deployment, so it should be saved (as described on the step 4 of the section above) before.

### Start the server

- Run `npm start` to start the server in `http://localhost:3001`.

### Testing

- Run `npm test` to run all the API tests.
- Run `npm run test:contracts` to run all the smart contracts tests.
  - Requires a buidler node running, though it can be avoided by running instead: `export SOLIDITY_COVERAGE=false; scripts/test.sh `.


## Using Buidler

### Configuration

- The `buidler` configuration can be found in [buidler.config.js](./buidler.config.js).
- Modify the `network` object inside this file to include any other blockchain configuration you may need.
- Use the `--network` option along with `npx builder` commands to use a different network (e.g, `npx builder deploy --network testnet` to deploy in a testnet specified in the buidler configuration file). If this flag is not passed then `develop` will be used. Current configured networks are:
  - _develop_: a local buidler node
  - _testnet_: a EVM-based testnet network, currently supporting: Ethereum Goerli or RSK testnet.
  - _mainnet_: a EVM-based testnet network, currently supporting: Ethereum mainnet or RSK mainnet.
- More logs can be obtained on the commands by configuring `hideLogs=false` on `config/($DEPLOYMENT).js`.

#### Mainnet/testnet configuration

Various environment variables have to be configured on the `.env` file for interacting with this networks:
- __MAINNET_ACCOUNT__: the private key of a mainnet wallet
- __MAINNET_URL__: the URL for the RPC of a mainnet node
- __TESTNET_ACCOUNT__: the private key of a testnet wallet
- __TESTNET_URL__: the URL for the RPC of a testnet node

### Tasks

Several buidler tasks were included for interacting from CLI with the deployed contracts:
- __src/rest/services/helpers/buidlerClaimTasks.js__: tasks for interacting with the claim registry
- __src/rest/services/helpers/buidlerProjectTasks.js__: tasks for interacting with the projects registry
- __src/rest/services/helpers/buidlerTasks.js__: deployment tasks and other remainder

For example, a project can be created by running:
```bash
$ npx buidler create-project --id 44 --ipfs-hash "0x1234"
```


## Contributing

You could find more information about how contribute in this project in [CONTRIBUTING](CONTRIBUTING.md)

# Contacts

-
