const { randomBytes } = require('crypto');

console.log(randomBytes(256).toString('base64'));
