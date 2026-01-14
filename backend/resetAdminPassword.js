import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const email = "admin@example.com";
const newPassword = "admin123";

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(newPassword, salt);

const admin = await User.findOneAndUpdate(
  { email },
  { password: hashedPassword },
  { new: true }
);

console.log("Admin updated:", admin);

await mongoose.disconnect();
process.exit();
