import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    status: {
      type: String,
      enum: ["placed", "shipped", "delivered", "completed", "cancelled"],
      default: "completed"
    },
    totalAmount: { type: Number, required: true },
    reviewed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

