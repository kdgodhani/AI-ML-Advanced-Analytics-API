// https://fakestoreapi.com/products     -- data get form this api   electronics


"use strict";
const product = require("../models/product");

const addProduct = async (req, res, next) => {
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

const getAllProductList = async (req, res, next) => {
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

const getProductById = async (req, res, next) => {
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
  addProduct,
  getAllProductList,
  getProductById,
};
