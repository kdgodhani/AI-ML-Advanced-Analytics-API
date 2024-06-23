"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const {
  createUserSchema,
  userLoginSchema,
} = require("../validations/user.validation");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const {
  getAllProductList,
  addProduct,
  getProductById,
} = require("../controllers/product.controller");

router.post("/add", verifyToken, addProduct);

router.get("/getAll", verifyToken, getAllProductList);

router.get("/getById", verifyToken, getProductById);

module.exports = router;
