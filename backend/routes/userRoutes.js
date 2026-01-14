// userRoutes.js
import express from "express";
import {
  getMe,
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  removeFromCart,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  editAddress
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ Logged-in user info
router.get("/me", protect, getMe);

// ====================== ADDRESS ROUTES ======================
router.post("/address", protect, addAddress);
router.put("/address/:addressId", protect, editAddress);
router.delete("/address/:addressId", protect, deleteAddress);
router.put("/address/:addressId/default", protect, setDefaultAddress);
// ===========================================================

// ✅ Admin user management
router.get("/", protect, allowRoles("admin"), getUsers);
router.get("/:id", protect, allowRoles("admin"), getUser);
router.put("/:id/role", protect, allowRoles("admin"), updateUserRole);
router.delete("/:id", protect, allowRoles("admin"), deleteUser);

// Wishlist
router.post("/wishlist/:bookId", protect, addToWishlist);
router.delete("/wishlist/:bookId", protect, removeFromWishlist);

// Cart
router.post("/cart/:bookId", protect, addToCart);
router.delete("/cart/:bookId", protect, removeFromCart);

export default router;
