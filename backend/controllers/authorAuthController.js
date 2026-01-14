/*authorauthcontroller
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Author from "../models/authorModel.js";

export const registerAuthor = async (req, res) => {
  try {
    const { name, email, password, bio, category, profileImage } = req.body;

    // Check if already exists
    const existingAuthor = await Author.findOne({ email });
    if (existingAuthor) {
      return res.status(400).json({ message: "Author already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuthor = new Author({
      name,
      email,
      password: hashedPassword,
      bio,
      category,
      profileImage,
    });

    await newAuthor.save();

    res.status(201).json({ message: "Author registered successfully", author: newAuthor });
  } catch (error) {
    res.status(500).json({ message: "Error registering author", error: error.message });
  }
};

export const loginAuthor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    

    const isMatch = await bcrypt.compare(password, author.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: author._id, role: "author" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, author });
  } catch (error) {
    res.status(500).json({ message: "Error logging in author", error: error.message });
  }
}; */


import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Author
export const registerAuthor = async (req, res) => {
  try {
    const { name, email, password, bio, category, profileImage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Author already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuthor = new User({
      name,
      email,
      password: hashedPassword,
      role: "author",
      bio,
      category,
      profileImage,
    });

    await newAuthor.save();

    const token = jwt.sign({ id: newAuthor._id, role: "author" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Author registered successfully", author: newAuthor, token });
  } catch (error) {
    res.status(500).json({ message: "Error registering author", error: error.message });
  }
};

// Login Author
export const loginAuthor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const author = await User.findOne({ email, role: "author" });
    if (!author) return res.status(404).json({ message: "Author not found" });

    const isMatch = await bcrypt.compare(password, author.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: author._id, role: "author" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, author });
  } catch (error) {
    res.status(500).json({ message: "Error logging in author", error: error.message });
  }
};
