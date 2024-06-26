const mongoose = require("mongoose");

const PaymentLinkSchema = new mongoose.Schema(
  {
    link_id: { type: String, unique: true },
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
