const fs = require('fs');
const Cryptr = require('cryptr');
const pb = fs.readFileSync('./publicCredential.key', 'utf8');
// const pb = fs.readFileSync('./publicKeyLogin.key', 'utf8');
const appId = fs.readFileSync('./appId.key', 'utf8')
const cryptr = new Cryptr(pb);
let ss1 = [appId, '903801a3bfa89376'];
let ss2 = ss1.join('|');
const signatureNew = cryptr.encrypt(ss2);

module.exports = {signatureNew}