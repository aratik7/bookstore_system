// backend/models/Proposal.js
import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    publisherName: { type: String, required: true },
    bookTitle: { type: String, required: true },
    proposalBody: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);




/* backend/models/Proposal.js
import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema({
  title: String,
  summary: String,
  message: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  authorName: String,
  authorEmail: String,
  proposedPublisher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: String,
  coverUrl: String,
  price: Number,
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

const Proposal = mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);
export default Proposal; */
