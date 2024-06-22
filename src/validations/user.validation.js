"use strict";
const Joi = require("joi");
const pattern = /^.{8,20}$/;

const createUserSchema = Joi.object().keys({
  // id: Joi.number().optional(),
  email: Joi.string().required(),
  // password: Joi.string()
  //   .when("id", { is: 0, then: Joi.string().required() })
  //   .optional(),
  password: Joi.string().regex(RegExp(pattern)).min(8).max(20).required(),
  isActive: Joi.boolean()
    // .when("id", { is: 0, then: Joi.boolean().required() })
    .optional(),

  // currently below fileds are not in used
  firstName: Joi.string()
    // .when("id", { is: 0, then: Joi.string().required() })
    .optional(),
  lastName: Joi.string()
    // .when("id", { is: 0, then: Joi.string().required() })
    .optional(),
  role: Joi.string()
    // .when("id", { is: 0, then: Joi.string().required() })
    .optional(),
});

const userLoginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const userLogoutSchema = Joi.object().keys({
  id: Joi.number().required(),
});

// const insertUpdateModuleSchema = Joi.object().keys({
//   id: Joi.number().required(),
//   moduleName: Joi.string().optional(),
//   isActive: Joi.boolean()
//     .when("id", { is: 0, then: Joi.boolean().required() })
//     .optional(),
// });

// const insertUpdatePermissionSchema = Joi.object().keys({
//   id: Joi.number().required(),
//   permission: Joi.string().optional(),
//   isActive: Joi.boolean()
//     .when("id", { is: 0, then: Joi.boolean().required() })
//     .optional(),
// });

// const insertUpdateRoleSettingSchema = Joi.object().keys({
//   id: Joi.number().required(),
//   roleId: Joi.number().optional(),
//   permissionId: Joi.number().optional(),
//   moduleId: Joi.number().optional(),
//   isActive: Joi.boolean()
//     .when("id", { is: 0, then: Joi.boolean().required() })
//     .optional(),
// });

// const insertUpdateRoleMappingSchema = Joi.object().keys({
//   id: Joi.number().required(),
//   userId: Joi.number().optional(),
//   roleId: Joi.number().optional(),
//   isActive: Joi.boolean()
//     .when("id", { is: 0, then: Joi.boolean().required() })
//     .optional(),
// });

module.exports = {
  createUserSchema,
  userLoginSchema,
  userLogoutSchema,
  // insertUpdateModuleSchema,
  // insertUpdatePermissionSchema,
  // insertUpdateRoleSettingSchema,
  // insertUpdateRoleMappingSchema,
};
