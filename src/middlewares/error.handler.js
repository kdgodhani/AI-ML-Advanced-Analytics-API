"use strict";
const errorHandler = (err, req, res, next) => {
  // const errStatus = err.status || 500;
  const errMsg = err.message || "Something went wrong";
  const errData = err.data || {};
  const errSuccess = err.success || false;

  return res.status(500).json({
    success: errSuccess,
    // status: errStatus,
    message: errMsg,
    data: errData,
  });
};

module.exports = errorHandler;
