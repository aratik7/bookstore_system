// backend/routes/publisherRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPublisherProfile,
  updatePublisherProfile,
  //addBook,
  getPublisherBooks,
  updateBookPrice,
  deletePublisherBook,
  getPublisherProposals,
  acceptProposal,
  rejectProposal,
  getPublisherInsights,
} from "../controllers/publisherController.js";
import { verifyPublisher } from "../middleware/authMiddleware.js"; 
const router = express.Router();

// Publisher profile
router.get("/profile", protect, getPublisherProfile);
router.put("/profile", protect, updatePublisherProfile);

// Books routes
//router.post("/add-book", protect, allowRoles("publisher", "admin"), addBook);
router.get("/books", protect, getPublisherBooks);
router.put("/books/:id/price", protect, updateBookPrice);
// Delete book
router.delete("/books/:id", protect, deletePublisherBook);
// Proposals routes
router.get("/proposals", protect, getPublisherProposals);
router.put("/proposals/:id/accept", protect, acceptProposal);
router.put("/proposals/:id/reject", protect, rejectProposal);

// Insights
router.get("/insights", verifyPublisher, getPublisherInsights);

export default router;
