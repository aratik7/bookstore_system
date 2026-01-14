/* backend/routes/authorRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  getMyProfile,
  getAuthorProfile,
  createBook,
  getMyBooks,
  updateBook,
  deleteBook,
} from "../controllers/authorController.js";

const router = express.Router();

// Author profile routes
router.get("/me", protect, getMyProfile);
router.get("/me", protect, getAuthorProfile); // protected so only logged-in can view details

// Books (author)
router.post("/books", protect, allowRoles("author", "publisher", "admin"), createBook);
router.get("/books", protect, allowRoles("author", "publisher", "admin"), getMyBooks);
router.put("/books/:bookId", protect, allowRoles("author", "publisher", "admin"), updateBook);
router.delete("/books/:bookId", protect, allowRoles("author", "publisher", "admin"), deleteBook);

export default router;     */




// routes/authorRoutes.js
import express from "express";
import {
  getMyProfile,
  getAuthorProfile,
  createBook,
  getMyBooks,
  updateBook,
  deleteBook,
} from "../controllers/authorController.js";

import { verifyAuthor } from "../middleware/verifyAuthor.js"; // ✅ new middleware for author

const router = express.Router();

// 🧍 Author profile routes
router.get("/me", verifyAuthor, getMyProfile);

// (optional) Only admins can get any author profile if you want later — we skip for now
// router.get("/:id", verifyAdmin, getAuthorProfile);

// 📚 Books — only authors can manage their own
router.post("/books", verifyAuthor, createBook);
router.get("/books", verifyAuthor, getMyBooks);
router.put("/books/:bookId", verifyAuthor, updateBook);
router.delete("/books/:bookId", verifyAuthor, deleteBook);

export default router;
