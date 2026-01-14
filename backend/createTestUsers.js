import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const users = [
  { name: "Test User", email: "user@example.com", role: "user", password: "user123" },
  { name: "Test Author", email: "author@example.com", role: "author", password: "author123" },
  { name: "Test Publisher", email: "publisher@example.com", role: "publisher", password: "publisher123" },
  { name: "Test Admin", email: "admin@example.com", role: "admin", password: "admin123" },
];

for (const u of users) {
  const exists = await User.findOne({ email: u.email });
  if (exists) {
    console.log(`User ${u.email} already exists`);
    continue;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(u.password, salt);

  const newUser = await User.create({
    name: u.name,
    email: u.email,
    password: hashedPassword,
    role: u.role,
  });

  console.log(`Created ${u.role}: ${newUser.email}`);
}

await mongoose.disconnect();
console.log("All users created/verified.");
process.exit();
