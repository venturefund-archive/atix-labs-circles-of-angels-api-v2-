require('dotenv').config();
const fs = require("fs")
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");

const generate = async () => {
        const token = jwt.sign({ id:uuidv4() }, process.env.JWT_SECRET, {expiresIn: '9999 years'} );
        const file = await generateFile({token})
        return file;
    }
const generateFile = content => {
    const fileName = "jwt-key.json";
    try {
        if (!fs.existsSync("./keys")) {
            fs.mkdirSync("./keys");
            console.log("Directory is created.");
        }
        fs.writeFileSync(`./keys/${fileName}`, JSON.stringify(content));
      } catch (error) {
        throw Error(error.message);
      }
      return fileName;
}

generate();