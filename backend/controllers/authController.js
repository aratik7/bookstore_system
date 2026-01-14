/* backend/controllers/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
console.log("Loaded authController.js");

// ✅ Register user (allow all roles including admin, author, publisher)
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });
    }

    // Directly assign the requested role (admin, author, publisher, user)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user", // default to user if not provided
    });

    if (user) {
      res.status(201).json({
        status: "ok",
        message: "User registered successfully. Please login.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ status: "error", message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ✅ Login user
// backend/controllers/authController.js



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set in environment!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Admin can promote/demote roles
export const setRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["user", "author", "publisher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Set role error", error: err.message });
  }
};

// Admin: get all users
export const adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// Admin: get single user
export const adminGetUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

// Admin: update user
export const adminUpdateUser = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // don't allow direct password update here
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

// Admin: delete user
export const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};      */
//authcontroller
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

console.log("Loaded authController.js");

// ✅ Register User (works for user, author, publisher, admin)
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    const user = await User.create({
  name,
  email,
  password,
  role: role || "user",
});


    res.status(201).json({
      status: "ok",
      message: "User registered successfully. Please login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ✅ Login User (returns token + role + userId)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    console.log("Found user:", user);

    if (!user) return res.status(400).json({ status: "error", message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ status: "error", message: "Invalid email or password" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing!");
      return res.status(500).json({ status: "error", message: "Server configuration error" });
    }

    // ✅ Token includes both id and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "ok",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", message: "Server error", error: err.message });
  }
};

// ✅ Admin can change user roles
export const setRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["user", "author", "publisher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Set role error", error: err.message });
  }
};

// ✅ Admin utilities
export const adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

export const adminGetUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};



 