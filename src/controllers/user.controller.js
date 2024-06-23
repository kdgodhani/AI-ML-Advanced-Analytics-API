"use strict";
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_TOKEN;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;
let userMaping = require("../constants/role.mapping");
const user = require("../models/user");
const bcrypt = require("bcryptjs");
// let { encryptData, decryptData } = require("../utils/encrypt");

// Admin User Mannually entry in mongodb

// user_name : "admin",
// email : "admin@dhiwise.com",
// password : "$2a$10$eL9Tbhw2YJ3sOoEKLvcYC.aalfT/NKmeiBnuvHVsPhg7lPHmjU.ZK",  // Admin@123
// role:"Admin",

const userRegister = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;
    // let { userRole } = req.user;

    // Check if the user making the request is an Admin
    // if (!userRole || (userRole && userRole !== "Admin")) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only Admin Can Create User !!",
    //     data: [],
    //   });
    // }

    // Check if the user already exists
    let checkUser = await user.findOne({ email: email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Encrypt the password
    let encryptPassword = await bcrypt.hash(password, 10);

    // Create the new user
    let createUser = await user.create({
      user_name: name,
      email: email,
      password: encryptPassword,
      role: role ? role : "Customer"
    });

    // Return success response with created user data
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createUser,
    });
  } catch (error) {
    console.log(error, "user.controller -> userRegister");
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const checkUser = await user.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User is Not Found",
      });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    let finalData = [];
    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email, role: checkUser.role },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    let objModule = userMaping[checkUser.role];

    finalData.push({
      id: checkUser._id,
      email: checkUser.email,
      user_name:checkUser.user_name,
      token: token,
      user_role:checkUser.role,
      user_module_map: objModule ? objModule : [],
    });

    // Return the token
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data:finalData,
    });

  } catch (error) {
    console.log(error, "user.controller -> userLogin");
    next(error);
  }
};

const userResetPassword = async (req, res, next) => {
  try {
    // Get user input
    let { password } = req.body;

    let { userName: loginUser, id: loginUserId } = req.user;

    let pool = await poolPromise;
    let userExist = await pool
      .request()
      .input("userName", sql.NVarChar, loginUser)
      .execute("usp_checkRegisteredUser");

    if (userExist.recordset[0] && userExist.recordset[0].result == 0) {
      return res.send({
        success: false,
        message: "User detail not found !!",
      });
    }

    let encryptNewPassword = await encryptData(password);

    // Create user in our database
    let updateUser = await pool
      .request()
      .input("id", sql.Int, loginUserId)
      .input("password", sql.NVarChar, encryptNewPassword)
      .execute("usp_resetPassword");

    let userData = updateUser.recordset;

    if (userData && userData[0] && userData[0].ErrorNumber) {
      return res.send({
        success: false,
        message: "user Password not updated sucessfully",
      });
    }

    return res.send({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.log(error, "user.controller -> userResetPassword");
    next(error);
  }
};

const userForgotPassword = async (req, res, next) => {
  try {
    // Get user input
    let { password } = req.body;

    let { userName: loginUser, id: loginUserId } = req.user;

    let pool = await poolPromise;
    let userExist = await pool
      .request()
      .input("userName", sql.NVarChar, loginUser)
      .execute("usp_checkRegisteredUser");

    if (userExist.recordset[0] && userExist.recordset[0].result == 0) {
      return res.send({
        success: false,
        message: "User detail not found !!",
      });
    }

    let encryptNewPassword = await encryptData(password);

    // Create user in our database
    let updateUser = await pool
      .request()
      .input("id", sql.Int, loginUserId)
      .input("password", sql.NVarChar, encryptNewPassword)
      .execute("usp_resetPassword");

    let userData = updateUser.recordset;

    if (userData && userData[0] && userData[0].ErrorNumber) {
      return res.send({
        success: false,
        message: "user Password not updated sucessfully",
      });
    }

    return res.send({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.log(error, "user.controller -> userResetPassword");
    next(error);
  }
};

module.exports = {
  userRegister,
  userLogin,
  userResetPassword,
};
