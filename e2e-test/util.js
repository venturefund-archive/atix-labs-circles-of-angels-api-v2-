const { Pool } = require('pg');
const FormData = require('form-data');
const bunyan = require('bunyan');
const { Wallet } = require('ethers');
const bcrypt = require('bcrypt');
const { encrypt } = require('../src/rest/util/crypto');
const { encryption } = require('../src/rest/util/constants');
require('dotenv').config({ path: '../.env' });

const logger = bunyan.createLogger({ name: 'e2e test' });
const key = process.env.CRYPTO_KEY;
const ADMIN_PASSWORD = 'admin';

const connectDb = async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST
  });
  await pool.connect();
  return pool;
};

const doRequest = async (call, endpoint) => {
  const response = await call;
  if (![200, 201].includes(response.status))
    throw new Error(`There was an error hitting endpoint ${endpoint}`);
  return response;
};

const buildFormData = data => {
  const form = new FormData();
  Object.keys(data).forEach(_key => {
    form.append(_key, data[_key]);
  });
  return form;
};

const createOrGetAdminWithWallet = async pool => {
  try {
    await pool.query('BEGIN TRANSACTION');
    const email = 'e2e_admintest@mail.com';
    const queryResult = await pool.query(
      'SELECT * FROM public.user WHERE email = $1',
      [email]
    );
    if (queryResult.rows.length > 0) return queryResult.rows[0];

    const wallet = Wallet.createRandom();
    const { mnemonic, address } = wallet;
    const encryptedWallet = await wallet.encrypt(ADMIN_PASSWORD);
    const encryptedMnemonic = await encrypt(mnemonic.phrase, key);
    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      encryption.saltOrRounds
    );
    if (
      !encryptedMnemonic ||
      !encryptedMnemonic.encryptedData ||
      !encryptedMnemonic.iv
    )
      throw new Error('Mnemonic could not be encrypted');
    const params = [
      'Administrator',
      email,
      hashedPassword,
      address,
      encryptedWallet,
      encryptedMnemonic.encryptedData
    ];
    logger.info('Creating user...');
    const result = await pool.query(
      `
              INSERT INTO "user"(
                "firstName",
                 email, 
                 "password", 
                 address, 
                 "createdAt", 
                 role,
                 "isAdmin", 
                 "lastName", 
                 "blocked", 
                 "phoneNumber", 
                 company, 
                 answers, 
                 "countryId", 
                 "encryptedWallet", 
                 "forcePasswordChange", 
                 mnemonic, 
                 "emailConfirmation", 
                 id
              )
              VALUES($1, $2, $3, $4, 
                now(), 'admin'::role_old, true, '', false, NULL::character varying,
                NULL::character varying, '', 10, $5, true, $6,
                true,uuid_generate_v4())
              RETURNING 
                id_old,
                id,
                email`,
      params
    );
    logger.info('Creating wallet...');
    const user = result.rows[0];
    const walletParams = [
      user.id_old,
      user.id,
      address,
      encryptedWallet,
      encryptedMnemonic.encryptedData,
      encryptedMnemonic.iv
    ];
    await pool.query(
      `
              INSERT INTO user_wallet(
                "userId_old",
                "userId",
                address,
                "encryptedWallet",
                mnemonic,
                active,
                iv,
                "createdAt"
                )
                VALUES($1,$2,$3,$4,$5,true,$6,NOW())`,
      walletParams
    );
    await pool.query('COMMIT');
    return user;
  } catch (error) {
    logger.error('An error occured, rollbacking: ', error);
    await pool.query('ROLLBACK');
  }
};

module.exports = {
  connectDb,
  doRequest,
  buildFormData,
  createOrGetAdminWithWallet
};
