const mongoose = require("mongoose");
const tf = require("@tensorflow/tfjs");
// const { analyticsDataFn } = require("../controllers/report.controller");
const Transaction = require("../models/transaction");

const analyticsDataFn = async () => {
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

    return transactionData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};



let transactions = [
  {
    txn_amount: 18,
    txn_status: "Pending",
    payment_method: "Credit Card",
    txn_id: "66795813a7d902e2e9c9a74d",
    txn_date: "2024-06-24T11:27:15.364Z",
    order_id: "66795811a7d902e2e9c9a745",
    product_id: "667843deb0f97bc45646fd99",
    product_quantity: 1,
    order_status: "Pending",
    _id: "667843deb0f97bc45646fd99",
    name: "WD 2TB Elements Portable External Hard Drive - USB 3.0",
    price: 8,
    quantity: 100,
    category: "Electronics",
    seller_name: "KD Enterprise",
    reviews: [],
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
  },
  {
    txn_amount: 18,
    txn_status: "Pending",
    payment_method: "Credit Card",
    txn_id: "66795813a7d902e2e9c9a74d",
    txn_date: "2024-06-24T11:27:15.364Z",
    order_id: "66795811a7d902e2e9c9a745",
    product_id: "66784412b0f97bc45646fd9c",
    product_quantity: 1,
    order_status: "Pending",
    _id: "66784412b0f97bc45646fd9c",
    name: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 10,
    quantity: 100,
    category: "Electronics",
    seller_name: "KD Enterprise",
    reviews: [],
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  },
  {
    txn_amount: 3,
    txn_status: "Pending",
    payment_method: "Credit Card",
    txn_id: "66795813a7d902e2e0c9a74d",
    txn_date: "2024-06-24T11:27:15.364Z",
    order_id: "66795811a7d908e2e9c9a745",
    product_id: "66784412b0f98bc45646fd9c",
    product_quantity: 1,
    order_status: "Pending",
    _id: "66784412b0f97bc45646fd9c",
    name: "T-shirt",
    price: 3,
    quantity: 100,
    category: "Cloth",
    seller_name: "KD Enterprise",
    reviews: [],
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  },
  {
    txn_amount: 5,
    txn_status: "Pending",
    payment_method: "Credit Card",
    txn_id: "66795813a7d912e2e0c9a74d",
    txn_date: "2024-06-24T11:27:15.364Z",
    order_id: "66795811a7d918e2e9c9a745",
    product_id: "66784412b1f98bc45646fd9c",
    product_quantity: 1,
    order_status: "Pending",
    _id: "66784412b1f98bc45646fd9c",
    name: "wood table",
    price: 3,
    quantity: 100,
    category: "Furniture",
    seller_name: "Wooder",
    reviews: [],
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  },
  {
    txn_amount: 5,
    txn_status: "Pending",
    payment_method: "Credit Card",
    txn_id: "66795816a7d902e2e9c9a74d",
    txn_date: "2024-06-24T11:27:15.364Z",
    order_id: "66795810a7d902e2e9c9a745",
    product_id: "66784412b0f97bc45646fd9c",
    product_quantity: 1,
    order_status: "Pending",
    _id: "66784412b0f97bc45646fd9c",
    name: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 5,
    quantity: 100,
    category: "Electronics",
    seller_name: "SytemCall",
    reviews: [],
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
  },
];

let model;
let productIds = [];
let categoryIds = [];

async function loadTransactions() {
  const transactions = await analyticsDataFn();

  return transactions.map((transaction) => ({
    txn_amount: transaction.txn_amount,
    payment_method: transaction.payment_method,
    product_id: transaction.product_id.toString(),
    category: transaction.category,
  }));
}

async function trainModel(data) {
  const productIdsSet = new Set(data.map((item) => item.product_id));
  productIds = Array.from(productIdsSet);

  const categoryIdsSet = new Set(data.map((item) => item.category));
  categoryIds = Array.from(categoryIdsSet);

  const encodedData = data.map((item) => ({
    txn_amount: item.txn_amount,
    payment_method: item.payment_method === "Credit Card" ? 1 : 0,
    product_id: productIds.indexOf(item.product_id),
    category: categoryIds.indexOf(item.category),
  }));

  tf.util.shuffle(encodedData);

  const xs = encodedData.map((item) => [
    item.txn_amount,
    item.payment_method,
    item.product_id,
    item.category,
  ]);
  const ys = encodedData.map((item) => item.product_id);

  const xTensor = tf.tensor2d(xs);
  const yTensor = tf.oneHot(tf.tensor1d(ys, "int32"), productIds.length);

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, activation: "relu", inputShape: [4] }));
  model.add(tf.layers.dense({ units: productIds.length, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(xTensor, yTensor, {
    epochs: 50,
    validationSplit: 0.2,
    callbacks: tf.callbacks.earlyStopping({ monitor: "val_loss", patience: 5 }),
  });

  console.log("Model trained!");
}

async function predictDemand(txn_amount, payment_method, product_id, category) {
  if (!model) {
    console.error("Model not loaded!");
    return null;
  }

  const encodedData = [
    {
      txn_amount,
      payment_method: payment_method === "Credit Card" ? 1 : 0,
      product_id: productIds.indexOf(product_id),
      category: categoryIds.indexOf(category),
    },
  ];

  const prediction = model.predict(
    tf.tensor2d(encodedData.map((item) => [
      item.txn_amount,
      item.payment_method,
      item.product_id,
      item.category,
    ]))
  );

  const predictedIndex = prediction.argMax(1).dataSync()[0];
  const predictedProductId = productIds[predictedIndex];

  return predictedProductId;
}

module.exports = {
  loadTransactions,
  trainModel,
  predictDemand,
};
  
// async function initializeModel() {
//   const transactions = await loadTransactions();
//   await trainModel(transactions);
// }
// initializeModel()
//   .then(() => {
//     console.log("Model initialized and trained!");
//   })
//   .catch((error) => {
//     console.error("Failed to initialize and train model:", error);
//   });

