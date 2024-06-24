const { getProductByIds } = require("../controllers/product.controller");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const cron = require("node-cron");
const { faker } = require("@faker-js/faker");

const { STRIPE_SECRET_KEY, REACT_BASE_URL } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const paymentCheckout = async (req, res) => {
  try {
    const productRequests = req.body;
    const products = [];
    for (const request of productRequests) {
      const productDoc = await getProductByIds(request.id);
      const product = productDoc.toObject();
      products.push({ ...product, quantity: request.quantity });
    }

    // Map the products array to the format required by Stripe
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          description: product.description,
          images: [product.Image],
        },
        unit_amount: product.price * 100, // Stripe expects the amount in cents
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${REACT_BASE_URL}/payment/success`,
      cancel_url: `${REACT_BASE_URL}/payment/failure`,
    });

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

module.exports = {
  paymentCheckout,
  addFakeData,
  txnReport,
};
