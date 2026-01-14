// backend/routes/proposalRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Proposal from "../models/Proposal.js";

const router = express.Router();

// POST → create a proposal (author)
router.post("/", protect, async (req, res) => {
  try {
    const { title, category, content, publisher } = req.body;

    const proposal = await Proposal.create({
      authorId: req.user._id,
      authorName: req.user.name,
      publisherName: publisher,
      bookTitle: title,
      proposalBody: content,
      status: "pending",
    });

    res.status(201).json({ message: "Proposal submitted successfully", proposal });
  } catch (error) {
    console.error("❌ Proposal submission error:", error);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

// GET → fetch proposals for a publisher
// 📩 Get all proposals assigned to this publisher (publisher dashboard)
// GET proposals for a specific publisher
router.get("/publisher/:publisherName", async (req, res) => {
  try {
    const { publisherName } = req.params;
    const proposals = await Proposal.find({
      publisherName: { $regex: new RegExp(publisherName, "i") }, // case-insensitive match
    });
    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Accept / Reject proposal
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "publisher") {
      return res.status(403).json({ error: "Only publishers can update proposals" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updatedProposal = await Proposal.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedProposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    res.json({ message: "Proposal updated", updatedProposal });
  } catch (err) {
    console.error("❌ Error updating proposal:", err);
    res.status(500).json({ error: "Failed to update proposal" });
  }
});

// 👩‍💻 GET → Fetch proposals submitted by logged-in author
router.get("/myproposals", protect, async (req, res) => {
  try {
    const proposals = await Proposal.find({ authorId: req.user._id });
    res.json(proposals);
  } catch (error) {
    console.error("Error fetching author proposals:", error);
    res.status(500).json({ error: "Failed to fetch author proposals" });
  }
});


export default router;
