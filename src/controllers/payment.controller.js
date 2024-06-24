const { getProductByIds } = require("../controllers/product.controller");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Order = require("../models/order");
const cron = require("node-cron");
const { faker } = require("@faker-js/faker");

const { STRIPE_SECRET_KEY, REACT_BASE_URL } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const paymentCheckout = async (req, res, next) => {
  try {
    const { productsData } = req.body;

    let { role, id } = req.user;

    let orderData = await Order({
      user_id: id,
      products: productsData,
      order_status: "Pending",
    });

    const products = [];
    let totalAmount = 0;

    for (const request of productsData) {
      const productDoc = await getProductByIds(request.product_id);
      const product = productDoc.toObject();
      products.push({
        product_id: request.product_id,
        product_quantity: request.product_quantity,
        ...product,
      });
      totalAmount += product.price * request.product_quantity;
    }

    orderData.products = products;
    orderData.total_amount = totalAmount;

    // console.log(orderData, "orderData -- ");
    await orderData.save();

    // Map the products array to the format required by Stripe
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          description: product.description,
          images: [product.image],
        },
        unit_amount: product.price * 100, // Stripe expects the amount in cents
      },
      quantity: product.quantity,
    }));

    let orderId = orderData.id;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${REACT_BASE_URL}/payment/success?orderId=${orderId}`,
      cancel_url: `${REACT_BASE_URL}/payment/failure?orderId=${orderId}`,
    });

    let txnData = await Transaction({
      user_id: id,
      order_id: orderId,
      txn_amount: totalAmount,
      txn_status: "Pending",
      payment_method: "Credit Card",
      txn_date: Date.now(),
      comment: "redirect Stripe page ",
    });

    await txnData.save();

    return res.status(200).json({
      success: true,
      message: "Payment Successfull",
      data: session,
    });
  } catch (error) {
    console.log(error, " payment.contorller -> paymentCheckOut");
    next(error);
  }
};

const addFakeData = async (req, res) => {
  try {
    const transactionData = await Transaction.create({
      user_id: new mongoose.Types.ObjectId(),
      order_id: new mongoose.Types.ObjectId(),
      txn_amount: faker.commerce.price({ min: 2, max: 10 }),
      txn_status: faker.helpers.arrayElement(["Pending", "Success", "Failed"]),
      payment_method: faker.helpers.arrayElement([
        "COD",
        "UPI",
        "Debit Card",
        "Credit Card",
      ]),
      txn_date: faker.date.recent(),
      comment: faker.lorem.sentence(),
    });

    if (transactionData) {
      return true;
    }
    return false;
    // return res.status(200).json({
    //   success: true,
    //   message: "transaction add sucessfully ",
    //   data: transactionData,
    // });
  } catch (error) {
    console.log(error, "payment.controller -> addFakeData");
  }
};

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
      return res.status(404).json({ message: "Transaction data  not found" });
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

module.exports = {
  paymentCheckout,
  addFakeData,
  txnReport,
  analyticsData,
};
