const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Order = require("../models/order");
const Product = require("../models/product");
const cron = require("node-cron");

let {
  loadTransactions,
  trainModel,
  predictDemand,
} = require("../utils/mlModel");

// now cron run every 55 minute
cron.schedule("*/55 * * * *", async () => {
  let cronRun = await addFakeData();

  console.log(cronRun, "cron Run status ---s ");
});

const txnReport = async (req, res) => {
  try {
    let reportData = {};
    const totalSalesVolume = await Transaction.aggregate([
      { $match: { txn_status: "Success" } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$txn_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          salesVolume: "$totalSales",
        },
      },
    ]);

    const paymentMethods = await Transaction.aggregate([
      { $match: { txn_status: "Success" } },
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          totalSaleByPayMethod: { $sum: "$txn_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMethod: "$_id",
          count: 1,
          totalSaleByPayMethod: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const transactionStatus = await Transaction.aggregate([
      {
        $group: {
          _id: "$txn_status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          paymentStatus: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const transactionData = await Transaction.aggregate([
      { $match: { txn_status: "Success" } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $unwind: "$order.products",
      },
      {
        $lookup: {
          from: "products",
          localField: "order.products.product_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          txn_amount: "$txn_amount",
          txn_status: "$txn_status",
          payment_method: "$payment_method",
          txn_id: "$_id",
          txn_date: "$txn_date",
          order_id: "$order._id",
          product_id: "$order.products.product_id",
          product_quantity: "$order.products.product_quantity",
          order_status: "$order.order_status",
          _id: "$productDetails._id",
          name: "$productDetails.name",
          // description: "$productDetails.description",
          price: "$productDetails.price",
          quantity: "$productDetails.quantity",
          category: "$productDetails.category",
          seller_name: "$productDetails.seller_name",
          reviews: "$productDetails.reviews",
          image: "$productDetails.image",
        },
      },
    ]).exec();

    reportData.sales_volume =
      totalSalesVolume && totalSalesVolume.length > 0
        ? totalSalesVolume[0].salesVolume
        : 0;
    reportData.payment_method =
      paymentMethods && paymentMethods.length > 0 ? paymentMethods : [];
    reportData.txn_status =
      transactionStatus && transactionStatus.length > 0
        ? transactionStatus
        : [];
    reportData.txn_data =
      transactionData && transactionData.length > 0 ? transactionData : [];

    return res.status(200).json({
      success: true,
      message: "report data fetched !! ",
      data: reportData,
    });
  } catch (error) {
    console.log(error, "payment.controller -> txnReport");
  }
};

const analyticsData = async (req, res) => {
  try {
    const transactionData = await Transaction.aggregate([
      // { $match: { txn_status: "Success" } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $unwind: "$order.products",
      },
      {
        $lookup: {
          from: "products",
          localField: "order.products.product_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          txn_amount: "$txn_amount",
          txn_status: "$txn_status",
          payment_method: "$payment_method",
          txn_id: "$_id",
          txn_date: "$txn_date",
          order_id: "$order._id",
          product_id: "$order.products.product_id",
          product_quantity: "$order.products.product_quantity",
          order_status: "$order.order_status",
          _id: "$productDetails._id",
          name: "$productDetails.name",
          // description: "$productDetails.description",
          price: "$productDetails.price",
          quantity: "$productDetails.quantity",
          category: "$productDetails.category",
          seller_name: "$productDetails.seller_name",
          reviews: "$productDetails.reviews",
          image: "$productDetails.image",
        },
      },
    ]).exec();

    if (!transactionData.length) {
      return res.status(404).json({
        success: false,
        message: "report data not found !! ",
        data: transactionData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "report data fetched !! ",
      data: transactionData,
    });

    // res.json(transactionData[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// same function for ML model generation
// const analyticsDataFn = async () => {
//   try {
//     const transactionData = await Transaction.aggregate([
//       // { $match: { txn_status: "Success" } },
//       {
//         $lookup: {
//           from: "orders",
//           localField: "order_id",
//           foreignField: "_id",
//           as: "order",
//         },
//       },
//       {
//         $unwind: "$order",
//       },
//       {
//         $unwind: "$order.products",
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "order.products.product_id",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: "$productDetails",
//       },
//       {
//         $project: {
//           txn_amount: "$txn_amount",
//           txn_status: "$txn_status",
//           payment_method: "$payment_method",
//           txn_id: "$_id",
//           txn_date: "$txn_date",
//           order_id: "$order._id",
//           product_id: "$order.products.product_id",
//           product_quantity: "$order.products.product_quantity",
//           order_status: "$order.order_status",
//           _id: "$productDetails._id",
//           name: "$productDetails.name",
//           // description: "$productDetails.description",
//           price: "$productDetails.price",
//           quantity: "$productDetails.quantity",
//           category: "$productDetails.category",
//           seller_name: "$productDetails.seller_name",
//           reviews: "$productDetails.reviews",
//           image: "$productDetails.image",
//         },
//       },
//     ]).exec();

//     return transactionData;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// same function for ML model generation
const modelTrain = async (req, res, next) => {
  try {
    const transactions = await loadTransactions();
    let trainedData = await trainModel(transactions);

    return res.status(200).json({
      success: true,
      message: "Model trained successfully!",
      data: trainedData,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const predictProduct = async (req, res, next) => {
  try {
    const { txn_amount, payment_method, product_id, category } = req.query;

    const transactions = await loadTransactions();
    await trainModel(transactions);

    const predictedProductId = await predictDemand(
      Number(txn_amount),
      payment_method,
      product_id,
      category
    );

    let productData = await Product.findById(predictedProductId);
    if (!productData) {
      return res.status(200).json({
        success: false,
        message: "Currently Not Found any peridiction !",
        data: predictedProductId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "predict data successfully!",
      data: productData,
    });

    // res.json({ predicted_product_id: predictedProductId });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  txnReport,
  analyticsData,
  predictProduct,
  modelTrain,
};
