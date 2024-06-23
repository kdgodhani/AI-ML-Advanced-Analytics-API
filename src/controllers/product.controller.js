// https://fakestoreapi.com/products     -- data get form this api   electronics

"use strict";
const Product = require("../models/product");

const addProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      category,
      sellerName,
      reviews,
      image,
    } = req.body;

    const isProductExits = await Product.findOne({ name: name });

    // Checking if product is already created.
    if (isProductExits) {
      return res.status(409).json({
        success: false,
        message: "Product already exits.!!",
      });
    }

    // Create and save the product in a single step
    const productData = await Product.create({
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      category: category,
      seller_name: sellerName,
      reviews: reviews,
      image: image,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: productData,
    });
  } catch (error) {
    console.log(error, "product.controller -> addProduct");
    next(error);
  }
};

const getAllProductList = async (req, res, next) => {
  try {
    let productList = await Product.find();

    if (!productList || productList.length == 0) {
      return res.status(404).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Return success response with created user data
    return res.status(200).json({
      success: true,
      message: "Product Data Fetched sucessfully",
      data: productList,
    });
  } catch (error) {
    console.log(error, "product.controller -> getAllProductList");
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    let { productId } = req.query;

    // Check if the user already exists
    let productList = await Product.find({ _id: productId });

    if (!productList) {
      return res.status(404).json({
        success: false,
        message: "User is already registered",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product Data Fetched sucessfully",
      data: productList,
    });
  } catch (error) {
    console.log(error, "product.controller -> getProductById");
    next(error);
  }
};

const getProductByIds = async (id) => {
  try {
    // let { productId } = req.query;

    let productData = await Product.findById(id);

    if (productData) {
      return productData;
    }
  } catch (error) {
    console.log(error, "product.controller -> getProductByIds fn");
    next(error);
  }
};

module.exports = {
  addProduct,
  getAllProductList,
  getProductById,
  getProductByIds,
};
