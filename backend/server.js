//server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import authorRoutes from "./routes/authorRoutes.js"; // new path
import publisherRoutes from "./routes/publisherRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoute from "./routes/cartRoute.js";
import authorAuthRoutes from "./routes/authorAuthRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
dotenv.config();
const app = express();
const __dirname = path.resolve();

// Connect DB
await connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000"], // frontend URL
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/publisher", publisherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoute);
app.use("/api/authors-auth", authorAuthRoutes); // register/login authors
app.use("/api/authors", authorRoutes); // author profile & books
app.use("/api/proposals", proposalRoutes);
// Serve frontend (AFTER API routes)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build/index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
