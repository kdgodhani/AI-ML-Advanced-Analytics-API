const { getProductByIds } = require("../controllers/product.controller");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const Product = require("../models/product");
const Order = require("../models/order");
const PaymentLink = require("../models/paymentLink");
const cron = require("node-cron");
const { faker } = require("@faker-js/faker");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
let uuid = crypto.randomUUID();

const { STRIPE_SECRET_KEY, REACT_BASE_URL, JWT_TOKEN } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const categories = ["Electronics", "Mobiles", "Fashion", "Beauty"];

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
      cancel_url: `${REACT_BASE_URL}/payment/failed?orderId=${orderId}`,
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

const generatePaymentLink = async (req, res, next) => {
  const { orderId } = req.query;
  const expires_at = new Date();
  expires_at.setHours(expires_at.getHours() + 1);

  try {
    // Create a payment link
    const paymentLink = new PaymentLink({
      link_id: faker.string.uuid(),
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
  const { token } = req.query;
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_TOKEN);
    const paymentLink = await PaymentLink.findOne({ link_id: decoded.link_id });

    if (
      !paymentLink ||
      paymentLink.used ||
      paymentLink.expires_at < new Date()
    ) {
      // paymentLink.used = true;
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
        cancel_url: `${REACT_BASE_URL}/payment/failed?orderId=${orderId}`,
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

      paymentLink.used = true;
      await paymentLink.save();

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

const updateStatusByorderId = async (req, res, next) => {
  const { orderId, isSuccess } = req.body;
  try {
    let findOrder = await Order.findById(orderId);

    if (!findOrder) {
      return res.status(400).json({
        success: false,
        message: "Something wrong in DB",
      });
    }

    // findOrder.txn_status = isSuccess ? "Success" :""
    findOrder.order_status = isSuccess ? "Confirmed" : "Pending";
    findOrder.is_dummy = false; // i want to show only order which redirect to stripe gateway
    await findOrder.save();

    let findTxn = await Transaction.findOne({ order_id: orderId });

    findTxn.txn_status = isSuccess ? "Success" : "Failed";
    await findTxn.save();

    return res.status(200).json({
      success: true,
      message: `Order Transaction status ${findTxn.txn_status} upadte in DB !`,
    });
  } catch (error) {
    console.log(error, "updateStatusByorderId -> payment controller");
    next(error);
  }
};

const getCategoryName = (category) => {
  switch (category) {
    case "Electronics":
      return `Electronics-${faker.number.int({
        min: 10000000,
        max: 199999999,
      })}`;
    case "Mobiles":
      return `Mobiles-${faker.number.int({ min: 20000000, max: 299999999 })}`;
    case "Fashion":
      return `Fashion-${faker.number.int({ min: 30000000, max: 399999999 })}`;
    case "Beauty":
      return `Beauty-${faker.number.int({ min: 40000000, max: 499999999 })}`;
    default:
      return `Product-${faker.number.int({ min: 50000000, max: 599999999 })}`;
  }
};

const addFakeData = async (req, res) => {
  try {
    const category = faker.helpers.arrayElement(categories);
    const product = await Product.create({
      name: getCategoryName(category),
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 3, max: 20 }),
      quantity: faker.number.int({ min: 10, max: 50 }),
      category: category,
      seller_name: faker.internet.userName(),
      reviews: [],
      is_dummy: true,
      // image: faker.image.imageUrl(),
    });

    console.log(product.price, "this is product price ");

    // With the same Product id we generate around 20 diffrent order and there transaction
    for (let i = 0; i < 20; i++) {
      // console.log(i,"i valueeee --- ")
      const orderData = await Order.create({
        user_id: new mongoose.Types.ObjectId(),
        products: [
          {
            product_id: product.id,
            product_quantity: 1,
          },
        ],
        total_amount: product.price,
        order_status: faker.helpers.arrayElement([
          "Pending",
          "Confirmed",
          // "Shipped",
          // "Delivered",
          "Cancelled",
        ]),
        is_dummy: true,
      });

      // this is trxn data ==
      const transactionData = await Transaction.create({
        user_id: orderData.user_id,
        order_id: orderData.id,
        // txn_amount: faker.commerce.price({ min: 2, max: 10 }),
        txn_amount: orderData.total_amount,
        txn_status: faker.helpers.arrayElement([
          "Pending",
          "Success",
          "Failed",
        ]),
        payment_method: faker.helpers.arrayElement([
          "COD",
          "UPI",
          "Debit Card",
          "Credit Card",
        ]),
        txn_date: faker.date.recent(),
        comment: faker.lorem.sentence(),
        is_dummy: true,
      });
    }

    // return true;
    return res.send(true);
  } catch (error) {
    console.log(error, "payment.controller -> addFakeData");
  }
};

// now cron run every 55 minute
// cron.schedule("*/55 * * * *", async () => {
//   let cronRun = await addFakeData();

//   console.log(cronRun, "cron Run status ---s ");
// });

module.exports = {
  paymentCheckout,
  addFakeData,
  generatePaymentLink,
  verifyPaymentLink,
  updateStatusByorderId,
};
