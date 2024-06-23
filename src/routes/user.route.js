"use strict";
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const {
  createUserSchema,
  userLoginSchema,
} = require("../validations/user.validation");

const {
  validateBody,
  validateParams,
} = require("../validations/joi.validator");

const {
  userRegister,
  userLogin,
  userResetPassword,
} = require("../controllers/user.controller");

// Here Use of VerifyToken Middleware is only Admin can create User in Dashboard
// Admin Create in DB manually
router.post(
  "/register",
  // verifyToken,
  validateBody(createUserSchema),
  userRegister
);

router.post("/login", validateBody(userLoginSchema), userLogin);

router.post("/resetPassword", verifyToken, userResetPassword);



module.exports = router;
