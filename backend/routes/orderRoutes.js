//orderroutes
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  placeOrder,
  getMyOrders,
  adminGetOrders,
  adminUpdateOrder,
  adminDeleteOrder,
  adminAnalytics
} from "../controllers/orderController.js";

const router = Router();

// =======================
// USER ROUTES
// =======================
router.post("/", protect, placeOrder);              // Place new order
router.get("/my-orders", protect, getMyOrders);     // Get logged-in user's orders

// =======================
// ADMIN ROUTES
// =======================
router.get("/admin/all", protect, allowRoles("admin"), adminGetOrders);   // Get all orders
router.put("/admin/:id", protect, allowRoles("admin"), adminUpdateOrder); // Update order
router.delete("/admin/:id", protect, allowRoles("admin"), adminDeleteOrder); // Delete order
// Add analytics route for admin
router.get("/admin/analytics", protect, allowRoles("admin"), adminAnalytics);

export default router;
