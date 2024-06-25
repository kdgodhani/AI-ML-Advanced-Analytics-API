const { getProductByIds } = require("../controllers/product.controller");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Order = require("../models/order");
const PaymentLink = require("../models/paymentLink");
const cron = require("node-cron");
const { faker } = require("@faker-js/faker");
const jwt = require("jsonwebtoken");

const { STRIPE_SECRET_KEY, REACT_BASE_URL, JWT_TOKEN } = process.env;
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

    if (session && session.url) {
      return res.status(200).json({
        success: true,
        message: "Payment Successfull",
        data: session,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Something wrong in Payment ",
      });
    }
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
// cron.schedule("*/55 * * * *", async () => {
//   let cronRun = await addFakeData();

//   console.log(cronRun, "cron Run status ---s ");
// });

const generatePaymentLink = async (req, res, next) => {
  const { orderId } = req.body;
  const expires_at = new Date();
  expires_at.setHours(expires_at.getHours() + 1);

  try {
    // Create a payment link
    const paymentLink = new PaymentLink({
      order_id: orderId,
      expires_at,
    });

    // Generate JWT token for the link
    const token = jwt.sign({ link_id: paymentLink.link_id }, JWT_TOKEN, {
      expiresIn: "1h",
    });

    if (token) {
      await paymentLink.save();
    }

    return res.status(200).json({
      success: true,
      message: "Secure payment link generated !",
      data: {
        payment_link: `${REACT_BASE_URL}/payment/secureLink?token=${token}`,
      },
    });
  } catch (error) {
    console.log(error, "generatePaymentLink - payment.controller");
    next(error);
  }
};

const verifyPaymentLink = async (req, res, next) => {
  const { token } = req.body;
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_TOKEN);
    const paymentLink = await PaymentLink.findOne({ link_id: decoded.link_id });

    if (
      !paymentLink ||
      paymentLink.used ||
      paymentLink.expires_at < new Date()
    ) {
      paymentLink.used = true;
      await paymentLink.save();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired payment link",
      });
    }

    // Retrieve order details
    const order = await Order.findById(paymentLink.order_id);

    if (order && order.products && order.products.length > 0) {
      let productsData = order.products;
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

      let orderId = order.id;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${REACT_BASE_URL}/payment/success?orderId=${orderId}`,
        cancel_url: `${REACT_BASE_URL}/payment/failure?orderId=${orderId}`,
      });

      let txnData = await Transaction({
        user_id: order.user_id,
        order_id: orderId,
        txn_amount: totalAmount,
        txn_status: "Pending",
        payment_method: "Credit Card",
        txn_date: Date.now(),
        comment: "redirect Stripe page ",
      });

      await txnData.save();

      // paymentLink.used = true;
      // await paymentLink.save();

      if (session && session.url) {
        return res.status(200).json({
          success: true,
          message: "Payment Successfull",
          data: session,
        });

        // res.redirect(session.url);
      } else {
        return res.status(400).json({
          success: false,
          message: "payment not processed ",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Currently Payment not processed",
      });
    }
  } catch (error) {
    console.log(error, "verifyLink error -> payment controller");
    next(error);
  }
};

module.exports = {
  paymentCheckout,
  addFakeData,
  generatePaymentLink,
  verifyPaymentLink,
};
