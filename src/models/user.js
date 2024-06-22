
"use strict";
const { Types, Schema, model } = require("mongoose");
// const moment = require("moment");

const userSchema = new Schema(
  {
    first_name: {
        type: String,
        trim:true
    },
    last_name: {
        type: String,
        trim:true
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        unique: true,
    },
    token: {
        type: String,
    },
    role:{
      type: String,
      // Enum
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);


module.exports = model("user", userSchema);


