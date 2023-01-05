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

- ### Setup environment

  - Run `npm install` to install the dependencies.
  - Run `npm run node` to start a local buidler node instance in `http://localhost:8545`.
  - Create the database either manually as stated above or with Docker by running `cd docker && docker-compose up -d` (this is only for the development environment!!).

- ### Deploy locally the smart contracts

  Given a buidler node has been started:
  1. Compile the smart contracts by running `npx buidler compile`.
  2. Deploy the compiled contracts to the local network by running `npx buidler deploy`.
    This will fail if the contracts were already deployed on the network, a new deployment can be forced by using `npx buidler deploy --reset-states true`.

  __Development details__

  Deployed contracts are saved in the local `state.json` file:
    - This file contains the addresses of the deployed contracts per network (it's not updated for the contracts that no longer exist! Which easily happens when running a test network).
    - If there's any problem with the `state.json` it can be deleted (editing it can result in inconsistencies!), though that should never be the case, it should mostly serve as clean-up.
    - From this file are obtained the contracts on the backend

  Also:
    - More logs can be added by changing `hideLogs` to false on `config/($DEPLOYMENT).js`

- ### Start the server

  - Run `npm start` to start the server in `http://localhost:3001`.

- ### Testing

  - Run `npm test` to run all the API tests.
  - Run `npm run test:contracts` to run all the smart contracts tests.

## Configuration

- ### Network configuration

  - The `buidler` configuration can be found in [buidler.config.js](./buidler.config.js).
  - Modify the `network` object inside this file to include any other blockchain configuration you may need.
  - Use the `--network` option along with `npx builder` commands to use a different network (e.g, `npx builder deploy --network testnet` to deploy in a testnet specified in the buidler configuration file).

## Whitelisting Addresses

- ### Configuration

  Use the script located at `scripts/whiteListMigration.js` to whitelist (or remove from whitelist) a set of user addresses.  
  A file must be provided with the addresses to whitelist (or remove from whitelist) following this model:  
  `0xe5904695748fe4a84b40b3fc79de2277660bd1d3`  
  `0x92561f28ec438ee9831d00d1d59fbdc981b762b2`  
  `0x2ffd013aaa7b5a7da93336c2251075202b33fb2b`  
  `0x9fc9c2dfba3b6cf204c37a5f690619772b926e39`

- ### Execution

  To execute the script run this command:
  `npm run whitelist ./addressesToWhitelist.txt`

  This will look for the `addressesToWhitelist.txt` file located in the root folder of the project.

  To give another location, put the full path:  
  `npm run whitelist ./home/atix/coa/addressesToWhitelist.txt`

  If no parameter is specified, the program will try to import the `./__addressesToWhitelist.txt` in the root folder.

## Contributing

You could find more information about how contribute in this project in [CONTRIBUTING](CONTRIBUTING.md)

# Contacts

-
