"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

const { validateBody, validateQuery } = require("../validations/joi.validator");

const {
  txnReport,
  analyticsData,
  predictProduct,
  modelTrain,
} = require("../controllers/report.controller");

router.get(
  "/txnReport",
  verifyAdmin,
  // validateBody(addProductSchema),
  txnReport
);

router.get(
  "/analyticsData",
  verifyAdmin,
  // validateBody(addProductSchema),
  analyticsData
);

router.get(
  "/predictProduct",
  verifyToken,
  // validateBody(addProductSchema),
  predictProduct
);

router.get(
  "/modelTrain",
  verifyToken,
  // validateBody(addProductSchema),
  modelTrain
);

module.exports = router;
