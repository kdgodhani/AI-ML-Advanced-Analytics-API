const mongoose = require("mongoose");
const crypto = require("crypto");

let uuid = crypto.randomUUID();

const PaymentLinkSchema = new mongoose.Schema(
  {
    link_id: { type: String, default: uuid, unique: true },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("PaymentLink", PaymentLinkSchema);
