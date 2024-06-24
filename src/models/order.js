const mongoose = require('mongoose');
const { Schema } = mongoose;

// const orderSchema = new Schema(
//   {
//     user_id: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     products_id: {
//       type: Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     product_quantity: {
//       type: Number,
//       required: true,
//       defaulf: 1,
//     },
//     total_amount: {
//       type: Number,
//       required: true,
//     },
//     // txn_status: {
//     //   type: String,
//     //   enum: ["Pending", "Success", "Failed"],
//     // },
//     order_status: {
//       type: String,
//       enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending",
//     },
//     is_active: {
//       type: Boolean,
//     },
//   },
//   {
//     timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
//   }
// );

const orderSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    products: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        product_quantity: {
          type: Number,
          required: true,
          defaulf: 1,
        },
      },
    ],
    total_amount: {
      type: Number,
      required: true,
    },
    // txn_status: {
    //   type: String,
    //   enum: ["Pending", "Success", "Failed"],
    // },
    order_status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    is_active: {
      type: Boolean,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);




const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
