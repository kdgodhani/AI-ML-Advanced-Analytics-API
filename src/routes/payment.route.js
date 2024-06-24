"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const { addProductSchema } = require("../validations/product.validation");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const {
  paymentCheckout,
  addFakeData,
} = require("../controllers/payment.controller");

router.post(
  "/checkOut",
  verifyToken,
  // validateBody(addProductSchema),
  paymentCheckout
);

router.get(
  "/addData",
  // verifyToken,
  // validateBody(addProductSchema),
  addFakeData
);

module.exports = router;
