"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const { addProductSchema } = require("../validations/product.validation");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const {
  getAllProductList,
  addProduct,
  getProductById,
} = require("../controllers/product.controller");

router.post("/add", verifyAdmin, validateBody(addProductSchema), addProduct);

router.get("/getAll", verifyToken, getAllProductList);

router.get("/getById", verifyToken, getProductById);

module.exports = router;
