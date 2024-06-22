"use strict";
let mongoose = require("mongoose");

let db = {
  username: process.env.MONGO_DB_USER,
  password: process.env.MONGO_DB_PASSWORD,
  server: process.env.MONGO_DB_SERVER,
  database: process.env.MONGO_DB_NAME,
  port: process.env.MONGO_DB_PORT,
};

// pdb Local
let url = `mongodb://${db.server}:27017/${db.database}`;

// for username password
// let url = `mongodb://${db.username}:${db.password}@${db.server}:27017/${db.database}?retryWrites=true&w=majority`;

exports.connection = async () => {
  try {
    await mongoose.connect(url, {
    });
    console.log("MongoDB Database Connected");
  } catch (error) {
    console.log("Database Connectivity Error", error);
    throw error;
  }
};

// module.exports = connection;
