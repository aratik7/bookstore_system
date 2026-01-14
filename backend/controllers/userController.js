// userController.js
import User from "../models/User.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// ====================== GET LOGGED-IN USER ======================
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id)
      .populate("wishlist")
      .populate({
        path: "cart.book",
        model: "Book",
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛠️ Clean null cart items
    user.cart = user.cart.filter((item) => item.book !== null);

    res.json(user);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== ADMIN USER CONTROLS ======================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "author", "publisher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating role", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// ====================== WISHLIST ======================
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();
    }

    const updatedUser = await User.findById(userId)
      .populate("wishlist")
      .populate("cart.book");

    res.json({
      success: true,
      message: "Book added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("❌ addToWishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(
      (id) => id && id.toString() !== bookId
    );

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("wishlist")
      .populate("cart.book");

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("❌ removeFromWishlist error:", error.message);
    res.status(500).json({ message: "Failed to remove item from wishlist" });
  }
};

// ====================== CART ======================
export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const existingItem = user.cart.find(
      (item) => item.book.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({
        book: new mongoose.Types.ObjectId(bookId),
        quantity: 1,
      });
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("wishlist")
      .populate("cart.book");

    res.json({
      success: true,
      message: "Book added to cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("❌ addToCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(
      (item) => item.book.toString() !== bookId
    );

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("wishlist")
      .populate("cart.book");

    res.json({
      success: true,
      message: "Book removed from cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("❌ removeFromCart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== ADDRESS MANAGEMENT ======================

// ➕ Add Address
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Address text is required" });

    const newAddress = {
      _id: uuidv4(),
      text,
      isDefault: user.addresses.length === 0 // First address becomes default
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({ success: true, address: newAddress, addresses: user.addresses });
  } catch (error) {
    console.error("❌ addAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Edit Address
export const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { text } = req.body;

    const user = await User.findById(req.user._id);
    const addr = user.addresses.find((a) => a._id === addressId);

    if (!addr) return res.status(404).json({ message: "Address not found" });

    addr.text = text;
    await user.save();

    res.json({ success: true, address: addr, addresses: user.addresses });
  } catch (error) {
    console.error("❌ editAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter((a) => a._id !== addressId);

    // If default deleted → set first as default
    if (!user.addresses.some((a) => a.isDefault) && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("❌ deleteAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ⭐ Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses.forEach((a) => {
      a.isDefault = a._id === addressId;
    });

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("❌ setDefaultAddress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
