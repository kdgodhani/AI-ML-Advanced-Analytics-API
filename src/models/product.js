const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      // this quantity is product Stoke
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    seller_name: {
      type: String,
    },
    reviews: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },
      },
    ],
    image: {
      type: String,
    },
    is_dummy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
