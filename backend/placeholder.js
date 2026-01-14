// backend/controllers/authorController.js
export const placeholder = (_req, res) => res.json({ ok: true });

// backend/controllers/publisherController.js
export const placeholder = (_req, res) => res.json({ ok: true });

// backend/controllers/adminController.js
export const placeholder = (_req, res) => res.json({ ok: true });

// backend/routes/authorRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { placeholder } from "../controllers/authorController.js";
const router = Router();
router.get("/me", protect, allowRoles("author"), placeholder);
export default router;

// backend/routes/publisherRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { placeholder } from "../controllers/publisherController.js";
const router = Router();
router.get("/me", protect, allowRoles("publisher"), placeholder);
export default router;

// backend/routes/adminRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { placeholder } from "../controllers/adminController.js";
const router = Router();
router.get("/me", protect, allowRoles("admin"), placeholder);
export default router;
