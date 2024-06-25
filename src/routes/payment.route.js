"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const { addProductSchema } = require("../validations/product.validation");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const {
  paymentCheckout,
  addFakeData,
  generatePaymentLink,
  verifyPaymentLink,
} = require("../controllers/payment.controller");

router.post(
  "/checkOut",
  verifyToken,
  // validateBody(addProductSchema),
  paymentCheckout
);

router.get(
  "/addData",
  // verifyAdmin,
  // validateBody(addProductSchema),
  addFakeData
);

router.post(
  "/generateLink",
  verifyAdmin,
  // validateBody(addProductSchema),
  generatePaymentLink
);

router.post(
  "/verifyLink",
  // verifyAdmin,
  // validateBody(addProductSchema),
  verifyPaymentLink
);

module.exports = router;
