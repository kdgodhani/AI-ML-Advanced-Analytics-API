
"use strict";
const { Types, Schema, model } = require("mongoose");
// const moment = require("moment");

const userSchema = new Schema(
  {
    user_name: {
      type: String,
      trim: true,
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
    role: {
      type: String,
      enum: ["Admin", "Seller", "Customer"], // seller is not used in this project
    },
    is_active: {
      type: Boolean,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);


module.exports = model("User", userSchema);


