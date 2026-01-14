/*authmiddleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};  */

//authmiddleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect routes and attach user to req.user
export const protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next(); // ✅ Stop here if success
    }

    return res.status(401).json({ message: "No token provided" }); // ✅ Return to avoid falling to next()
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" }); // ✅ Safe return
  }
};

// 🎯 Role-based Access Control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of: ${roles.join(", ")}`,
      });
    }
    next();
  };
};
//import jwt from "jsonwebtoken";
//import User from "../models/User.js";

export const verifyPublisher = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.role !== "publisher") {
      return res.status(403).json({ message: "Access denied. Not a publisher." });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("verifyPublisher error:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};


//import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
