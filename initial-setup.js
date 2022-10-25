const { Pool } = require('pg');
const crypto = require('crypto');
const { Wallet } = require('ethers');
const bcrypt = require('bcrypt');
require('dotenv').config();

const emailClient = require('./src/rest/services/helpers/emailClient');
const { injectDependencies } = require('./src/rest/util/injection');
const { encrypt } = require('./src/rest/util/crypto');
const { encryption } = require('./src/rest/util/constants');

const config = require('./setup-config.json');
const mailService = require('./src/rest/services/mailService');
const logger = require('./src/rest/logger');

const key = process.env.CRYPTO_KEY;

const GENESIS_ADMIN_PW = 'admin';

const run = async () => {
  const { email } = config;
  const pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST
  });
  try {
    await pool.connect();
    await pool.query('BEGIN TRANSACTION');
    const wallet = Wallet.createRandom();
    const { mnemonic, address } = wallet;
    const encryptedWallet = await wallet.encrypt(GENESIS_ADMIN_PW);
    const encryptedMnemonic = await encrypt(mnemonic.phrase, key);
    const hashedPassword = await bcrypt.hash(
      GENESIS_ADMIN_PW,
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
       "role", 
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
      now(), 'admin'::role, '', false, NULL::character varying,
      NULL::character varying, '', 10, $5, true, $6,
      true,uuid_generate_v4())
    RETURNING 
      id_old,
      id`,
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
    logger.info('Creating token...');
    const hash = await crypto.randomBytes(25);
    const token = hash.toString('hex');
    await pool.query(
      `
    INSERT INTO pass_recovery(
      email,
      token,
      "createdAt",
      "expirationDate"
    )
    VALUES($1,$2, NOW(), NOW() + INTERVAL '1 year')
    `,
      [email, token]
    );
    await pool.query('COMMIT');
    injectDependencies(mailService, { emailClient });
    await mailService.sendEmailInitialRecoveryPassword({
      to: email,
      bodyContent: {
        token,
        email
      }
    });
    logger.info('Success run!');
  } catch (error) {
    logger.error('An error occured, rollbacking: ', error);
    await pool.query('ROLLBACK');
  }
  process.exit(1);
};

run();
