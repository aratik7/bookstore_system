//adminController
import User from "../models/User.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.bookId);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("items.book");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};
