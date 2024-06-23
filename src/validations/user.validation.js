"use strict";
const Joi = require("joi");
const pattern = /^.{8,20}$/;

const createUserSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().regex(RegExp(pattern)).min(8).max(20).required(),
  isActive: Joi.boolean()
    .optional(),
    name: Joi.string()
    .required(),
  role: Joi.string().valid('Customer', 'Seller').optional(), 

});

const userLoginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const userLogoutSchema = Joi.object().keys({
  id: Joi.number().required(),
});


module.exports = {
  createUserSchema,
  userLoginSchema,
  userLogoutSchema,
};
