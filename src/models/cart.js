const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Currently we are not using this model to cart value
//  just just store cart value to local storage
const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // productId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Product",
    //   required: true,
    // },
    // buy_quantity: {
    //   type: Number,
    //   required: true,
    //   min: 1,
    // },
    // price: {
    //   type: Number,
    //   required: true,
    // },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product", // assuming you have a Product model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Middleware to update the total price and updatedAt before saving
CartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  this.updated_at = Date.now();
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
