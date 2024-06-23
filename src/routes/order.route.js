"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const { addProductSchema } = require("../validations/product.validation");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const { addProduct } = require("../controllers/product.controller");

const payment = require("./payment.route");
router.use("/payment", payment);

router.post(
  "/create",
  verifyToken,
  //  validateBody(addProductSchema),
  addProduct
);

module.exports = router;
