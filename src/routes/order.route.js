"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const {
  getAllPendingOrders,
  getOrdersByUserId,
  getTxnDoneOrder,
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
  verifyToken,
  //  validateBody(addProductSchema),
  getOrdersByUserId
);

router.get(
  "/getTxnDoneOrder",
  verifyToken,
  //  validateBody(addProductSchema),
  getTxnDoneOrder
);

module.exports = router;
