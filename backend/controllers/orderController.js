//odercontroller
import Order from "../models/Order.js";
import User from "../models/User.js";
import Book from "../models/Book.js";

// =======================
// Place Order
// =======================
export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, contactNumber, paymentMethod } = req.body;

    // ✅ Allowed payment methods
    const allowedPayments = ["cash on delivery", "upi", "rupay"];
    if (!allowedPayments.includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ Populate book details
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const book = await Book.findById(item.bookId).select("title coverUrl price author");
        if (!book) throw new Error(`Book not found: ${item.bookId}`);

        return {
          bookId: book._id,   // matches schema
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          price: book.price,
          quantity: item.quantity,
        };
      })
    );

    // ✅ Create new order
    const order = new Order({
      user: req.user._id,
      items: populatedItems,
      totalAmount,
      address,
      contactNumber,
      paymentMethod,
      status: "Pending",
    });

    const createdOrder = await order.save();

    // ✅ Clear user's cart after order
    await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    res.status(201).json(createdOrder);
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// =======================
// Get Logged-in User's Orders
// =======================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.bookId", "title coverUrl price author");

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching my orders:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =======================
// Admin: Get All Orders
// =======================
export const adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.bookId", "title coverUrl price author");

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// =======================
// Admin: Update Order
// =======================
export const adminUpdateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const order = await Order.findByIdAndUpdate(id, updates, { new: true })
      .populate("user", "name email")
      .populate("items.bookId", "title coverUrl price author");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "✅ Order updated successfully", order });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// =======================
// Admin: Delete Order
// =======================
export const adminDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "✅ Order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
//import mongoose from "mongoose";

// =======================
// Admin: Analytics (Monthly + Category-wise)
// =======================
export const adminAnalytics = async (req, res) => {
  try {
    // Group by Month + Category
    const salesByCategoryPerMonth = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "books",
          localField: "items.bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            category: "$bookDetails.category",
          },
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);
    console.log(salesByCategoryPerMonth);
    res.json({ salesByCategoryPerMonth });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics", details: err.message });
  }
};
