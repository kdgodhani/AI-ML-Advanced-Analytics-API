"use strict";
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_TOKEN;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;
let userMaping = require("../constants/role.mapping");
const User = require("../models/user");
const UserDetail = require("../models/userDetail");
const bcrypt = require("bcryptjs");
// let { encryptData, decryptData } = require("../utils/encrypt");

// Admin User Mannually entry in mongodb
// user_name : "admin",
// email : "admin@dhiwise.com",
// password : "$2a$10$eL9Tbhw2YJ3sOoEKLvcYC.aalfT/NKmeiBnuvHVsPhg7lPHmjU.ZK",  // Admin@123
// role:"Admin",

/**   ---------                User is Customer and Customer is User           ----------------------- */
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
    let checkUser = await User.findOne({ email: email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Encrypt the password
    let encryptPassword = await bcrypt.hash(password, 10);

    // Create the new user
    let createUser = await User.create({
      user_name: name,
      email: email,
      password: encryptPassword,
      role: role ? role : "Customer",
    });

    // On User create add data to UserDetail data with default value null

    // we also add customer data CRUD api
    await UserDetail.create({
      user_id: createUser._id,
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
    const checkUser = await User.findOne({ email });
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
      user_name: checkUser.user_name,
      token: token,
      user_role: checkUser.role,
      user_module_map: objModule ? objModule : [],
    });

    // Return the token
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: finalData,
    });
  } catch (error) {
    console.log(error, "user.controller -> userLogin");
    next(error);
  }
};

const modifyUserDetail = async (req, res, next) => {
  try {
    let { houseNumber, city, street, zipcode, phoneNumber } = req.body;

    let { id, email, role } = req.user;
    // Check if the user already exists
    let checkUser = await User.findOne({ _id: id });
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User Not Found !!",
      });
    }

    let existingCustomer = await UserDetail.findOne({ user_id: id });

    if (existingCustomer) {
      // Update existing customer data
      let updatedCustomer = await UserDetail.findByIdAndUpdate(
        existingCustomer._id,
        {
          house_number: houseNumber,
          city: city,
          street: street,
          zipcode: zipcode,
          phone_number: phoneNumber,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "UserDetail data updated successfully",
        data: updatedCustomer,
      });
    } else {
      // Create new customer data  / some default value
      let newCustomer = await UserDetail.create({
        user_id: id,
        house_number: 10,
        city: "Surat",
        street: "varachha",
        zipcode: 394101,
        phone_number: 9876543210,
      });

      return res.status(201).json({
        success: true,
        message: "UserDetail data created successfully",
        data: newCustomer,
      });
    }
  } catch (error) {
    console.log(error, "user.controller -> addCustomerDetail");
    next(error);
  }
};

module.exports = {
  userRegister,
  userLogin,
  modifyUserDetail,
};
