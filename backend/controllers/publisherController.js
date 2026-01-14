//publishercontroller
import Book from "../models/Book.js";
import User from "../models/User.js";
import Proposal from "../models/Proposal.js"; // optional
import Order from "../models/Order.js";

// ✅ Fetch Publisher Profile
//publishercontroller
export const getPublisherProfile = async (req, res) => {
  try {
    const publisher = await User.findById(req.user._id).select("-password");

    if (!publisher || publisher.role !== "publisher") {
      return res.status(404).json({ message: "Publisher not found" });
    }

    // Fetch books of this publisher (filter by category = Romance)
    const romanceBooks = await Book.find({
      publisher: publisher._id,
      category: /romance/i,
    });

    res.json({
      user: {
        _id: publisher._id,
        name: publisher.name,
        bio: publisher.bio || "",
        logoUrl: publisher.logoUrl || "",
        awards: publisher.awards || [],
        email: publisher.email,
      },
      romanceBooks,
    });
  } catch (error) {
    console.error("❌ Error in getPublisherProfile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Publisher Profile
export const updatePublisherProfile = async (req, res) => {
  try {
    const { name, bio, logoUrl, awards } = req.body;

    const publisher = await User.findById(req.user._id);
    if (!publisher || publisher.role !== "publisher") {
      return res.status(404).json({ message: "Publisher not found" });
    }

    if (name) publisher.name = name;
    if (bio) publisher.bio = bio;
    if (logoUrl) publisher.logoUrl = logoUrl;
    if (awards) {
      publisher.awards = Array.isArray(awards)
        ? awards
        : typeof awards === "string"
        ? awards.split(",").map((a) => a.trim())
        : publisher.awards;
    }

    await publisher.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: publisher._id,
        name: publisher.name,
        bio: publisher.bio,
        logoUrl: publisher.logoUrl,
        awards: publisher.awards,
        email: publisher.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in updatePublisherProfile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all Books by this Publisher
// ✅ Show all books belonging to this publisher
export const getPublisherBooks = async (req, res) => {
  try {
    const books = await Book.find({
      publisher: req.user._id, // match logged-in publisher
    }).populate("author", "name email");

    if (!books.length) {
      console.warn(`No books found for publisher ${req.user._id}`);
    }

    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching publisher books:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Update Book Price
// ✅ Update Book Price (Fixed)
export const updateBookPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // Make sure book exists and belongs to this publisher
    const book = await Book.findOne({ _id: id, publisher: req.user._id });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // ✅ Update price using findByIdAndUpdate (does NOT trigger full validation)
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { $set: { price } },
      { new: true, runValidators: false } // don't revalidate all fields
    ).populate("publisher", "name email");

    res.json({
      message: "Price updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("❌ Error updating book price:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Delete Book
export const deletePublisherBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      publisher: req.user._id,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Publisher Proposals (if applicable)
export const getPublisherProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ publisher: req.user._id }).populate(
      "author",
      "name email"
    );
    res.json(proposals);
  } catch (error) {
    console.error("❌ Error fetching proposals:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Accept Proposal
export const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      publisher: req.user._id,
    });
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    proposal.status = "accepted";
    await proposal.save();
    res.json({ message: "Proposal accepted successfully" });
  } catch (error) {
    console.error("❌ Error accepting proposal:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reject Proposal
export const rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.id,
      publisher: req.user._id,
    });
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    proposal.status = "rejected";
    await proposal.save();
    res.json({ message: "Proposal rejected successfully" });
  } catch (error) {
    console.error("❌ Error rejecting proposal:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Publisher Insights
// ✅ backend/controllers/publisherController.js

/*import Book from "../models/bookModel.js";
import Order from "../models/orderModel.js";
import Publisher from "../models/publisherModel.js";  */

//import User from "../models/User.js";
//import Book from "../models/BookModel.js";
//import Order from "../models/OrderModel.js";

export const getPublisherInsights = async (req, res) => {
  try {
    const publisherId = req.user?._id;

    // ✅ Confirm publisher exists and is valid
    const publisher = await User.findById(publisherId);
    if (!publisher || publisher.role !== "publisher") {
      return res.status(404).json({ message: "Publisher not found or invalid" });
    }

    // ✅ Step 1: Find all books by this publisher
    const books = await Book.find({ publisher: publisherId });

    // ✅ Step 2: Aggregate total sales per book
    const salesByBook = await Promise.all(
      books.map(async (book) => {
        const totalOrders = await Order.aggregate([
          { $match: { "items.bookId": book._id } },
          { $unwind: "$items" },
          { $match: { "items.bookId": book._id } },
          { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
        ]);

        const totalSold = totalOrders[0]?.totalSold || 0;
        return { title: book.title, sales: totalSold };
      })
    );

    // ✅ Step 3: Return the response
    res.json({
      publisherName: publisher.name,
      salesByBook,
    });
  } catch (err) {
    console.error("Error generating insights:", err);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
};
