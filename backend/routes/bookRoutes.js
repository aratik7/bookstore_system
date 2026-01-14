//bookroutes
import express from "express";
import mongoose from "mongoose"; // ✅ Import mongoose to convert string → ObjectId
import Book from "../models/Book.js";
import {
  listBooks,
  listBooksByCategory,
  getBookById,
  getMyBooks,
   getBooksByAuthor,
   getBooksByPublisher,
  createBook,
  addBook,
  updateBookPrice,
  deletePublisherBook,
  approveBook,
  rejectBook,
  adminListBooks,
  adminUpdateBook,
  adminDeleteBook,
  addReview,
  deleteReview,
} from "../controllers/bookController.js";
//import { verifyToken } from "../middleware/authMiddleware.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
//import Book from "../models/Book.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get books by specific author (fixed ObjectId casting)
router.get("/author/:authorId", getBooksByAuthor);
// ✅ Get all books for the logged-in publisher
router.get(
  "/publisher/books",
  protect,
  authorizeRoles("publisher", "admin"),
  getBooksByPublisher
);


// Public routes
router.get("/", listBooks);
router.get("/category/:category", listBooksByCategory);

// Protected routes
router.get("/my-books", protect, getMyBooks);
//router.get("/author/:id", getBooksByAuthor); 
router.post("/", protect, authorizeRoles("author", "publisher", "admin"), createBook);
//arouter.post("/", addBook);
// bookRoutes.js
router.put("/:id", protect, authorizeRoles("publisher", "admin"), updateBookPrice);
router.delete("/:id", protect, authorizeRoles("publisher", "admin"), deletePublisherBook);


// moderation
router.put("/approve/:id", protect, authorizeRoles("publisher", "admin"), approveBook);
router.put("/reject/:id", protect, authorizeRoles("publisher", "admin"), rejectBook);

//bookroutes which has adminroutes
router.get("/admin/all", protect, authorizeRoles("admin"), adminListBooks);
router.put("/admin/:id", protect, authorizeRoles("admin"), adminUpdateBook);
router.delete("/admin/:id", protect, authorizeRoles("admin"), adminDeleteBook);

// reviews
router.post("/:id/review", protect, addReview);
router.delete("/:id/review/:reviewId", protect, deleteReview);
router.get("/:id", getBookById);

export default router;
