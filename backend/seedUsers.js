// backend/seedUsers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear old users
    await User.deleteMany({});

    // Create test users with correct roles
    const users = [
      { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
      { name: "Test Author", email: "author@example.com", password: "author123", role: "author" },
      { name: "Test Publisher", email: "publisher@example.com", password: "publisher123", role: "publisher" },
      { name: "Normal User", email: "user@example.com", password: "user123", role: "user" }
    ];

    for (let u of users) {
      const newUser = new User(u);
      await newUser.save(); // password gets hashed via pre-save middleware
    }

    console.log("✅ Users seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding users:", err.message);
    process.exit(1);
  }
};

seedUsers();
