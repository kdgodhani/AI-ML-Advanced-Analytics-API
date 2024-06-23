const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserDetailSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      //   required: true,
    },
    street: {
      type: String,
      //   required: true,
    },
    house_number: {
      type: String,
      //   required: true,
    },
    zipcode: {
      type: String,
      //   required: true,
    },
    phone_number: {
      type: String,
      //   unique: true,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const UserDetail = mongoose.model("UserDetail", UserDetailSchema);
module.exports = UserDetail;
