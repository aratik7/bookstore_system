//order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        title: String,
        author: String,
        coverUrl: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    contactNumber: String,
    address: String,
    paymentMethod: {
      type: String,
      enum: ["cash on delivery", "Rupay", "UPI"],
      default: "cash on delivery",
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
