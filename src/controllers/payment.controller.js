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


module.exports = {
  paymentCheckout,
  addFakeData,
};
