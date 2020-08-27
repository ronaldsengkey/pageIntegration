const fs = require('fs');
let serverKey = fs.readFileSync('./server.key', 'utf8');
let privateKEY = fs.readFileSync('./private.key', 'utf8');
let publicKEY = fs.readFileSync('./public.key', 'utf8');
let publicKey = fs.readFileSync('./publicRsa.key', 'utf8');
const Cryptr = require('cryptr');
const crypto = require('crypto');
const cryptr = new Cryptr(serverKey);
const NodeRSA = require('node-rsa');
const pub = fs.readFileSync('./public.key', 'utf8');
const pubServer = fs.readFileSync('./publicServer.key', 'utf8');
const priv = fs.readFileSync('./private.key', 'utf8');
const keyAES = 'q6AdXos0hs947oNJqjTpendcKrHYVE2u';
const ivAES = 'G5SHxbZzRVyY1xXJ';
const keyAESClient = 'ARDhawGQqyOekSxfSRLrJIl4vstLncTh';
const ivAESClient = 'Oq9jCVi2w3RyU2VM';


function aesEncrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', keyAES, ivAES);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }
  
  function aesDecrypt(text) {
    let decipher = crypto.createDecipheriv('aes-256-cbc', keyAESClient, ivAESClient);
    let decrypted = decipher.update(text, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
  }
  
  function rsaEncrypt(text) {
    const keyPub = new NodeRSA(pubServer);
    let encrypted = keyPub.encrypt(text, 'base64');
    return encrypted;
  }
  
  function rsaDecrypt(text) {
    const keyPriv = new NodeRSA(priv);
    let decrypted = keyPriv.decrypt(text, 'utf8')
    return decrypted;
  }
  
  function encryptMessage(text) {
    let rsaFirst = rsaEncrypt(text);
    let aesThen = aesEncrypt(rsaFirst);
    return aesThen;
  }
  
  function decryptMessage(text) {
    let finalDecrypt;
    try {
        let aesFirst = aesDecrypt(text);
        finalDecrypt = rsaDecrypt(aesFirst);
    } catch (err) {
      try{
        finalDecrypt = aesDecrypt(text);
      }catch(f){
        try{
          finalDecrypt = rsaDecrypt(text);
        }catch(g){
          finalDecrypt = g;
        }
      }
    }
    return finalDecrypt;
  }

  module.exports = {aesEncrypt,aesDecrypt,rsaEncrypt,rsaDecrypt,encryptMessage,decryptMessage,pub,priv,cryptr,keyAESClient,ivAESClient};