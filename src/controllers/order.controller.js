const Transaction = require("../models/transaction");
const Product = require("../models/product");
const Order = require("../models/order");

const getAllPendingOrders = async (req, res, next) => {
  try {
    const allPendingOrder = await Order.aggregate([
      {
        $match: {
          order_status: "Pending",
        },
      },
      {
        $unwind: "$products", // Unwind the products array to access each product individually
      },
      {
        $lookup: {
          from: "products", // Name of the collection to join with
          localField: "products.product_id", // Field from the current collection (Order)
          foreignField: "_id", // Field from the referenced collection (Product)
          as: "products.productInfo", // Name for the new embedded field in the products array
        },
      },
      {
        $addFields: {
          "products.name": { $arrayElemAt: ["$products.productInfo.name", 0] }, // Add fields from productInfo
          "products.description": {
            $arrayElemAt: ["$products.productInfo.description", 0],
          },
          "products.price": {
            $arrayElemAt: ["$products.productInfo.price", 0],
          },
          "products.category": {
            $arrayElemAt: ["$products.productInfo.category", 0],
          },
          "products.seller_name": {
            $arrayElemAt: ["$products.productInfo.seller_name", 0],
          },
          "products.is_dummy": {
            $arrayElemAt: ["$products.productInfo.is_dummy", 0],
          },
        },
      },
      {
        $project: {
          products: {
            product_id: "$products.product_id",
            product_quantity: "$products.product_quantity",
            _id: "$products._id",
            name: "$products.name",
            description: "$products.description",
            price: "$products.price",
            category: "$products.category",
            seller_name: "$products.seller_name",
            is_dummy: "$products.is_dummy",
          },
          user_id: 1,
          total_amount: 1,
          order_status: 1,
          is_dummy: 1,
          created_at: 1,
          updated_at: 1,
          __v: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          user_id: { $first: "$user_id" },
          products: { $push: "$products" },
          total_amount: { $first: "$total_amount" },
          order_status: { $first: "$order_status" },
          is_dummy: { $first: "$is_dummy" },
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          __v: { $first: "$__v" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "getAll pending orders ",
      data: allPendingOrder,
    });
  } catch (error) {
    console.log(error, " order.contorller -> getAllPendingOrders");
    next(error);
  }
};

const getOrdersByUserId = async (req, res, next) => {
  try {
    return res.status(400).json({
      success: true,
      message: "getAll pending orders ",
    });
  } catch (error) {
    console.log(error, " payment.contorller -> paymentCheckOut");
    next(error);
  }
};

module.exports = {
  getAllPendingOrders,
  getOrdersByUserId,
};
