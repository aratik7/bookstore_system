import express from "express";
import {
  getAllUsers,
  deleteUser,
  getAllBooks,
  deleteBook,
  getAllOrders,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin routes
router.get("/users", getAllUsers);
router.get("/orders", getAllOrders);
router.get("/books", getAllBooks);
// router.get("/analytics", getSalesAnalytics);

// Approve / Delete books
// router.put("/books/:bookId/approve", approveBookProposal);
router.delete("/books/:bookId", deleteBook);

export default router;
