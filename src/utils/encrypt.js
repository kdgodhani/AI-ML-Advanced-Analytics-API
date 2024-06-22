"use strict";
const crypto = require("crypto");

const algorithm = "aes-256-cbc";

// const securitykey = crypto
//   .createHash("sha512")
//   .update(key)
//   .digest("hex")
//   .substring(0, 32);

const securitykey = process.env.SECRET_KEY;
// const initVector = crypto
//   .createHash("sha512")
//   .update(iv)
//   .digest("hex")
//   .substring(0, 16);
const initVector = process.env.SECRET_IV;

const encryptData = async function (data) {
  const cipher = crypto.createCipheriv(algorithm, securitykey, initVector);
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
};

const decryptData = async function (encryptedData) {
  const decipher = crypto.createDecipheriv(algorithm, securitykey, initVector);
  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};

module.exports = {
  encryptData,
  decryptData,
};
