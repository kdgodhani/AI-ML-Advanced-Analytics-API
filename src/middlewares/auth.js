"use strict";
const jwt = require("jsonwebtoken");
let TOKEN_KEY = process.env.JWT_TOKEN;

/*
Verify Token of JWT
*/
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  let err = {};
  if (authHeader) {
    const token = authHeader.split(" ")[1];
     jwt.verify(token, TOKEN_KEY, async (error, user) => {
      if (error && error.message) {
        console.log()
        err.message = error.message;
        err.success = false;
        return res.status(401).json(err);
      }

      req.user = user;
      next();
    });
  } else {
    err.message = "Token is missing !!";
    err.success = false;
    return res.status(400).json(err);
  }
};

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  let err = {};
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const userInfo = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );

    let pool = await poolPromise;
    let userExist = await pool
      .request()
      .input("id", sql.Int, userInfo.id)
      .execute("usp_checkUserById");

    if (userExist.recordset[0] && userExist.recordset[0].UserExist == 0) {
      return res.send({
        success: false,
        message: "Admin user is only allowed to access this end point !!",
      });
    }
    req.user = userInfo;
    next();

    // });
  } else {
    err.status = 400;
    err.message = "Missing userInfo";
    err.success = false;
    return res.status(err.status).json(err);
  }
};


module.exports = {
  verifyAdmin,
  verifyToken,
};
