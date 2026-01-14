// controllers/bookController.js
import Book from "../models/Book.js";
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Helper to compute avg rating and numReviews and attach to book object
 */
const attachRatingMeta = (bookDoc) => {
  const book = bookDoc.toObject ? bookDoc.toObject() : bookDoc;
  const reviews = book.reviews || [];
  const numReviews = reviews.length;
  const rating =
    numReviews === 0
      ? 0
      : reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / numReviews;
  return {
    ...book,
    rating: Number(rating.toFixed(1)),
    numReviews,
  };
};

// ==============================
// 📚 Public: List all approved books
// ==============================
export const listBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: "approved" })
      .populate("publisher", "name email")
      .sort({ createdAt: -1 });

    // attach rating & numReviews to each book
    const booksWithMeta = books.map(attachRatingMeta);

    // Return consistent object shape (frontend can handle both)
    return res.json({ books: booksWithMeta });
  } catch (error) {
    console.error("Error in listBooks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 📚 Get books by category
// ==============================
export const listBooksByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const books = await Book.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
      status: "approved",
    })
      .populate("publisher", "name email")
      .sort({ createdAt: -1 });

    const booksWithMeta = books.map(attachRatingMeta);
    return res.json({ books: booksWithMeta });
  } catch (error) {
    console.error("Error in listBooksByCategory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 📚 Get single book by id (public)
// ==============================
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(id)
      .populate("publisher", "name email")
      .populate("reviews.user", "name email"); // populate review authors if they exist

    if (!book) return res.status(404).json({ message: "Book not found" });

    const bookWithMeta = attachRatingMeta(book);
    return res.json({ book: bookWithMeta });
  } catch (error) {
    console.error("Error in getBookById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 📖 Get logged-in user's (author/publisher/admin) books
// ==============================
// 📖 Get logged-in user's (author/publisher/admin) books
export const getMyBooks = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "author") {
      // Only fetch books where the author matches the logged-in user
      filter = {
        $or: [
          { author: req.user._id }, // if stored as ObjectId
          { author: req.user.name }, // if stored as string
        ],
      };
    } else if (req.user.role === "publisher") {
      filter = { publisher: req.user._id };
    } else if (req.user.role === "admin") {
      filter = {}; // admin sees all books
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

// Replace your getMyBooks
const books = await Book.find(filter)
  .populate("author", "name email")  // populate author name and email
  .populate("publisher", "name email");
    res.json({ books });
  } catch (err) {
    console.error("Error fetching my books:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};
// ==============================
// 📚 Get books by author (for public or dashboard use)
//import Book from "../models/Book.js";
//import mongoose from "mongoose";

export const getBooksByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Invalid author ID format" });
    }

    const books = await Book.find({ author: authorId });

    if (!books || books.length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books by author:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Get books by publisherId
export const getBooksByPublisher = async (req, res) => {
  try {
    console.log("Logged-in user:", req.user);
    const publisherId = req.user?._id;

    if (!publisherId) {
      return res.status(401).json({ message: "Unauthorized: publisher not found" });
    }

    // ✅ Find books where either 'publisher' or 'publisherId' matches this publisher
    const books = await Book.find({
      $or: [
        { publisher: publisherId },
        { publisherId: publisherId }
      ]
    })
      .populate("publisher", "name email")
      .populate("author", "name email");

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching publisher books:", error);
    res.status(500).json({ message: "Server error" });
  }
};





// ==============================
// ✍️ Create a new book (author/publisher/admin)
// ==============================
// ✍️ Create a new book (author/publisher/admin)
//import Book from "../models/Book.js";
//import User from "../models/User.js";

export const createBook = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      category, 
      coverUrl, 
      author,
      authorName,        // ✅ Now accepting authorName
      publisherId, 
      publisherName, 
      publisherEmail 
    } = req.body;

    if (!title || !price || !author) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let finalPublisherId = publisherId || null;
    let finalPublisherName = publisherName || null;

    if (publisherEmail && !publisherId) {
      const publisher = await User.findOne({ email: publisherEmail, role: "publisher" });
      if (publisher) {
        finalPublisherId = publisher._id;
        finalPublisherName = publisher.name;
      }
    }

    const newBook = new Book({
      title,
      description,
      price,
      category,
      coverUrl,
      author,
      authorName,     // ✅ SAVE AUTHOR NAME HERE
      publisherId: finalPublisherId,
      publisherName: finalPublisherName,
    });

    const savedBook = await newBook.save();

    await User.findByIdAndUpdate(author, { $push: { books: savedBook._id } });

    if (finalPublisherId) {
      await User.findByIdAndUpdate(finalPublisherId, { $push: { books: savedBook._id } });
    }

    res.status(201).json(savedBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};


// 📚 Add Book (Ana Huang or other author)
export const addBook = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      coverUrl,
      author,
      publisher,
      publisherName,
      publisherId,
    } = req.body;

    if (!title || !price || !author) {
      return res
        .status(400)
        .json({ message: "Title, price, and author are required" });
    }

    const newBook = new Book({
      title,
      description,
      price,
      category,
      coverUrl,
      author,
      publisher,
      publisherName: publisherName || null, // ✅ added
      publisherId: publisherId || null, // ✅ added
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error("❌ Error adding book:", err);
    res.status(500).json({ message: "Failed to add book" });
  }
};



// ==============================
// ✏️ Update a book
// ==============================
// ==============================
// ✏️ Update a book
// ==============================
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // Find the existing book
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // ✅ Update only the price (preserve everything else)
    book.price = price ?? book.price;

    // ✅ Skip full validation (in case createdBy is missing)
    await book.save({ validateBeforeSave: false });

    // ✅ Re-fetch full book to include all related data
    const updatedBook = await Book.findById(id).populate("publisher", "name email");

    res.status(200).json({
      message: "Book price updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("❌ Error updating book price:", error);
    res.status(500).json({ message: "Failed to update book price" });
  }
  
};






// ==============================
// 🗑️ Delete a book
// ==============================
/*export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (
      book.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "publisher" 
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await book.deleteOne();
    res.json({ message: "Book removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  */
// ✅ Safe check for both ObjectId or string author field
// ✅ bookController.js
// ✅ bookController.js
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // ✅ Handles all possible author field formats
    const sameAuthor =
      (book.author?._id && book.author._id.toString() === req.user._id.toString()) || // populated
      (book.author?.toString?.() === req.user._id.toString()) || // ObjectId stored as value
      (book.author?.toLowerCase?.() === req.user.name?.toLowerCase()); // string name

    const canDelete =
      sameAuthor ||
      req.user.role === "admin" ||
      req.user.role === "publisher";

    if (!canDelete) {
      console.log(
        `Delete blocked for user: ${req.user.name} (${req.user._id}), book author: ${book.author}`
      );
      return res.status(403).json({ error: "Not authorized to delete this book" });
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: error.message });
  }
};




// ==============================
// ✅ Approve or ❌ Reject book (publisher/admin)
// ==============================
export const approveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.status = "approved";
    await book.save();
    const bookWithMeta = attachRatingMeta(book);
    res.json({ message: "Book approved", book: bookWithMeta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.status = "rejected";
    await book.save();
    const bookWithMeta = attachRatingMeta(book);
    res.json({ message: "Book rejected", book: bookWithMeta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 👑 Admin CRUD operations
// ==============================
export const adminListBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("publisher", "name email").sort({ createdAt: -1 });
    const booksWithMeta = books.map(attachRatingMeta);
    return res.json({ books: booksWithMeta });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const adminUpdateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("publisher", "name email");

    if (!book) return res.status(404).json({ message: "Book not found" });
    const bookWithMeta = attachRatingMeta(book);
    res.json({ book: bookWithMeta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminDeleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.deleteOne();
    res.json({ message: "Book deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ⭐ Reviews
// ==============================
export const addReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const alreadyReviewed = book.reviews?.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) return res.status(400).json({ message: "Book already reviewed" });

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    };

    book.reviews.push(review);
    await book.save();

    // return updated book with meta
    const populated = await Book.findById(book._id).populate("reviews.user", "name email").populate("publisher", "name email");
    const bookWithMeta = attachRatingMeta(populated);

    res.status(201).json({ message: "Review added", book: bookWithMeta });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const review = book.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    book.reviews.pull(review._id);
    await book.save();

    const populated = await Book.findById(book._id).populate("reviews.user", "name email").populate("publisher", "name email");
    const bookWithMeta = attachRatingMeta(populated);

    res.json({ message: "Review removed", book: bookWithMeta });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// bookController.js

// Rename for clarity — or just export aliases:
export const updateBookPrice = updateBook;
export const deletePublisherBook = deleteBook;
