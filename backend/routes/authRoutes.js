//authroutes
import express from "express";
import {
  signupUser,
  loginUser,   // ✅ this matches controller name now
  setRole,
  adminListUsers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Admin routes
router.put("/setrole", setRole);
router.get("/admin/users", adminListUsers);
router.get("/admin/users/:id", adminGetUser);
router.put("/admin/users/:id", adminUpdateUser);
router.delete("/admin/users/:id", adminDeleteUser);

export default router;
