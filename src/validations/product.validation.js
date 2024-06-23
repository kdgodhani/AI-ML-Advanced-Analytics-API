"use strict";
const Joi = require("joi");

const addProductSchema = Joi.object().keys({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().optional(),
  price: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().min(0).required(),
  category: Joi.string().trim().required(),
  sellerName: Joi.string().trim().optional(),
  reviews: Joi.array()
    .items(
      Joi.object({
        reviewer: Joi.string().trim().required(),
        comment: Joi.string().trim().optional(),
        rating: Joi.number().integer().min(1).max(5).optional(),
      }).optional()
    )
    .optional(),
  image: Joi.string().trim().optional(),
});

module.exports = {
  addProductSchema,
};
