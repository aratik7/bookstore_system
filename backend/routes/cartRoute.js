// backend/routes/cartRoute.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  removeFromCart,
} from "../controllers/userController.js"; // reuse controller funcs
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔹 Test route
 */
router.get("/test", (req, res) => {
  res.json({ status: "ok", message: "Cart route working" });
});

/**
 * 🔹 Get logged-in user’s cart
 * GET /api/cart
 */
// GET /api/cart
router.get("/", protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).populate("cart.book");

    // 🔹 Remove any items with null book
    if (user) {
      user.cart = user.cart.filter((item) => item.book !== null);

      // optional: persist cleanup in DB
      await user.save();
    }

    res.json({ status: "ok", cart: user?.cart || [] });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to fetch cart" });
  }
});

/**
 * 🔹 Add book to cart
 * POST /api/cart
 * { bookId, quantity }
 */
router.post("/", protect, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    let user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cart.find((c) => c.book.toString() === bookId);

    if (item) {
      item.quantity += quantity || 1;
    } else {
      user.cart.push({ book: bookId, quantity: quantity || 1 });
    }

    await user.save();
    user = await User.findById(req.user._id).populate("cart.book");

    res.json({ status: "ok", cart: user.cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to add to cart" });
  }
});

/**
 * 🔹 Update cart quantity
 * PATCH /api/cart/:bookId
 */
router.patch("/:bookId", protect, async (req, res) => {
  try {
    const { newQuantity } = req.body;
    const { bookId } = req.params;

    let user = await User.findById(req.user._id);

    let item = user.cart.find((c) => c.book.toString() === bookId);
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Book not in cart" });
    }

    item.quantity = newQuantity;
    await user.save();

    user = await User.findById(req.user._id).populate("cart.book");
    res.json({ status: "ok", cart: user.cart });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to update cart" });
  }
});

/**
 * 🔹 Remove from cart
 * DELETE /api/cart/:bookId
 */
router.delete("/:bookId", protect, async (req, res) => {
  try {
    const { bookId } = req.params;

    let user = await User.findById(req.user._id);
    user.cart = user.cart.filter((c) => c.book.toString() !== bookId);

    await user.save();
    user = await User.findById(req.user._id).populate("cart.book");

    res.json({ status: "ok", cart: user.cart });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to remove from cart" });
  }
});

export default router;
