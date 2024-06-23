"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const {
  createUserSchema,
  userLoginSchema,
  modifyUserDetailSchema,
} = require("../validations/user.validation");

const {
  validateBody,
  validateParams,
} = require("../validations/joi.validator");

const {
  userRegister,
  userLogin,
  modifyUserDetail,
} = require("../controllers/user.controller");

router.post(
  "/register",
  // verifyToken,
  validateBody(createUserSchema),
  userRegister
);

router.post("/login", validateBody(userLoginSchema), userLogin);

router.post(
  "/modifyDetail",
  verifyToken,
  validateBody(modifyUserDetailSchema),
  modifyUserDetail
);



module.exports = router;
