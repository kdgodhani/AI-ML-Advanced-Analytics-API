"use strict";
const validateObjectSchema = (data, schema) => {
  const validation = schema.validate(data);
  // const validation = schema.validate(data, { abortEarly: false });

  if (validation.error) {
    // let errorMessage = {};
    let errorMessage = "";
    Promise.all([
      validation.error.details.map((value) => {
        // errorMessage[value.context.key] = value.message;
        errorMessage = value.message;
      }),
    ]);
    return errorMessage;
  }
  return null;
};

const validateBody = (schema) => {
  return (req, res, next) => {
    let response = {};
    const error = validateObjectSchema(req.body, schema);
    if (error) {
      response.message = error;
      response.success = false;
      response.status = 400;

      return res.status(response.status).send(response);
    }
    return next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    let response = {};
    const error = validateObjectSchema(req.query, schema);
    if (error) {
      response.message = error;
      response.success = false;
      response.status = 400;

      return res.status(response.status).send(response);
    }
    return next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    let response = {};
    const error = validateObjectSchema(req.params, schema);
    if (error) {
      response.message = error;
      response.success = false;
      response.status = 400;

      return res.status(response.status).send(response);
    }
    return next();
  };
};

const validateQueryOrBody = (schema) => {
  return (req, res, next) => {
    let response = {};
    const error = validateObjectSchema({ ...req.query, ...req.body }, schema);
    if (error) {
      response.message = error;
      response.success = false;
      response.status = 400;

      return res.status(response.status).send(response);
    }
    return next();
  };
};

module.exports = {
  validateObjectSchema,
  validateBody,
  validateQuery,
  validateParams,
  validateQueryOrBody,
};
