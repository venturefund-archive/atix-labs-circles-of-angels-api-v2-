require('dotenv').config();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Logger = require('../src/rest/logger');

const generate = async () => {
  Logger.info('[TOKEN GENERATE] :: Generating the JWT Token...');
  const token = jwt.sign({ id: uuidv4() }, process.env.JWT_SECRET, {
    expiresIn: '9999 years'
  });
  Logger.info('[TOKEN GENERATE] :: JWT Generated...');
  Logger.info('[TOKEN GENERATE] ::creating token file...');
  const file = await generateFile({ token });
  return file;
};

const generateFile = content => {
  const fileName = 'jwt-key.json';
  try {
    if (!fs.existsSync('./keys')) {
      fs.mkdirSync('./keys');
      Logger.info('[TOKEN GENERATE] :: Creating the "Keys" directory...');
    }
    fs.writeFileSync(`./keys/${fileName}`, JSON.stringify(content));
    Logger.info(
      '[TOKEN GENERATE] :: JWT Generated and saved into the directory...'
    );
  } catch (error) {
    throw Error(error.message);
  }
  return fileName;
};

generate();
