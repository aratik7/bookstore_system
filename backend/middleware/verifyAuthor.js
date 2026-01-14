// backend/middleware/verifyAuthor.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyAuthor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "author") {
      return res.status(403).json({ message: "Access denied. Not an author." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("verifyAuthor error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
