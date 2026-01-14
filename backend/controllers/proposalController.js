//proposalController
import Proposal from "../models/Proposal.js";
import User from "../models/User.js";

// ✉️ Author submits a new proposal
export const createProposal = async (req, res) => {
  try {
    const { title, category, content, publisher } = req.body;

    // Verify that the publisher exists
    const publisherUser = await User.findOne({
      name: publisher,
      role: "publisher",
    });

    if (!publisherUser) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    const proposal = new Proposal({
      authorId: req.user._id,
      authorName: req.user.name,
      publisherName: publisher,
      bookTitle: title,
      proposalBody: content,
      status: "pending",
    });

    await proposal.save();
    res.status(201).json({ message: "Proposal submitted successfully", proposal });
  } catch (err) {
    console.error("❌ Error in createProposal:", err);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
};

// 📋 Publisher views proposals sent to them
export const getProposalsForPublisher = async (req, res) => {
  try {
    const proposals = await Proposal.find({ publisherName: req.user.name });
    res.json(proposals);
  } catch (err) {
    console.error("❌ Error in getProposalsForPublisher:", err);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
};

// 👩‍💻 Author views their own proposals
export const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ authorId: req.user._id });
    res.json(proposals);
  } catch (err) {
    console.error("❌ Error in getMyProposals:", err);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
};
// 📩 Get proposals submitted by a specific author
export const getProposalsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const proposals = await Proposal.find({ authorId });
    res.json(proposals);
  } catch (err) {
    console.error("❌ Error fetching author proposals:", err);
    res.status(500).json({ error: "Failed to fetch author proposals" });
  }
};

