// Script satu kali: generate JWT secrets dan tampilkan ke stdout
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('hex');

// Tulis ke file output
const out = `JWT_SECRET=${JWT_SECRET}\nJWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}\n`;
fs.writeFileSync(path.join(__dirname, 'generated-secrets.txt'), out, 'utf8');
console.log('Secrets written to scripts/generated-secrets.txt');
console.log('JWT_SECRET length:', JWT_SECRET.length);
