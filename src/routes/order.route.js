"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const {
  getAllPendingOrders,
  getOrdersByUserId,
} = require("../controllers/order.controller");

const payment = require("./payment.route");
router.use("/payment", payment);

router.get(
  "/getAllPendingOrders",
  verifyAdmin,
  //  validateBody(addProductSchema),
  getAllPendingOrders
);

router.get(
  "/getByUserId",
  verifyAdmin,
  //  validateBody(addProductSchema),
  getOrdersByUserId
);

module.exports = router;
