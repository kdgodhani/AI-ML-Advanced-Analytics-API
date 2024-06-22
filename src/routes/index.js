"use strict";
const express = require("express");
const router = express.Router();

const user = require("../routes/user.route");

router.use("/user", user);

module.exports = router;
