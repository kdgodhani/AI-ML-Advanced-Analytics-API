"use strict";
const express = require("express");
const router = express.Router();

const user = require("../routes/user.route");
const product = require("../routes/product.route");
const order = require("../routes/order.route");

router.use("/user", user);
router.use("/product", product);
router.use("/order", order);

module.exports = router;
