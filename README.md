# Circles of Angels - API

[![Coverage Status](https://coveralls.io/repos/gitlab/atixlabs-oss/coa-v2/circles-of-angels-api-v2/badge.svg?branch=develop)](https://coveralls.io/gitlab/atixlabs-oss/coa-v2/circles-of-angels-api-v2?branch=develop)

Circles of Angels is a platform that brings Social Entrepreneurs and Funders around the world closer while ensuring the transparency of investments and donations through blockchain technology, which allows for traceability of operations, tracking and visualization of the real impact that entrepreneurs are generating in their communities.

## Prerequisites

- See [.nvmrc](./.nvmrc) file

- Configured PostgreSQL database

## Tools and frameworks

- fastify@1.14.3

- solc@0.5.8

- @nomiclabs/buidler@1.1.2

## Creating the database

The schema for the `coadb` database can be found in [schema.sql](./db/scripts/schema.sql).
Execute this script by running `psql -d postgres -a -f schema.sql` to create the database.

## Contributing

Clone the repository by running `git@gitlab.com:atixlabs-oss/circles-of-angels-api.git` and create a new branch from the latest development branch

**Remember not to commit nor push the .env file**

## Development

- ### Setup environment

  - Run `npm install` to install the dependencies.
  - Run `npx ganache-cli` to start a local ganache instance in `http://localhost:8545`.
  - Create the database either manually as stated above or with Docker by running `cd docker && docker-compose up -d` (this is only for the development environment!!).

- ### Deploy smart contracts with buidler

  - Compile the smart contracts by running `npx buidler compile`.
  - Deploy the compiled contracts to the local network by running `npx buidler deploy`.

- ### Start the server

  - Run `npm start` to start the server in `http://localhost:3001`.

- ### Testing

  - Run `npm test` to run all the API tests.
  - Run `npx buidler test` to run all the smart contracts tests.

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
