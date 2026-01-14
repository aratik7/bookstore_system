import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

const authors = [
  //{ name: "anahuang", email: "ana@author.com" },
  //{ name: "colleenhoover", email: "colleen@author.com" },
  { name: "Matt Haig", email: "matt@author.com" },
  { name: "Paulo Coelho", email: "paulo@author.com" },
  { name: "Sally Rooney", email: "sally@author.com" },
  { name: "F. Scott Fitzgerald", email: "fitzgerald@author.com" },
  { name: "Stephen King", email: "stephen@author.com" },
  { name: "Gillian Flynn", email: "gillian@author.com" },
  { name: "Alex Michaelides", email: "alex@author.com" },
  { name: "Paula Hawkins", email: "paula@author.com" },
  { name: "Walter Isaacson", email: "walter@author.com" },
  { name: "Robert C. Martin", email: "robert@author.com" },
  { name: "Stuart Russell", email: "stuart@author.com" },
  { name: "Nir Eyal", email: "nir@author.com" },
  { name: "Eric Ries", email: "eric@author.com" },
  { name: "Plato", email: "plato@author.com" },
  { name: "Marcus Aurelius", email: "marcus@author.com" },
  { name: "Friedrich Nietzsche", email: "nietzsche@author.com" },
  { name: "Immanuel Kant", email: "kant@author.com" },
  { name: "Martin Heidegger", email: "heidegger@author.com" },
  { name: "Masashi Kishimoto", email: "kishimoto@author.com" },
  { name: "Eiichiro Oda", email: "oda@author.com" },
  { name: "Hajime Isayama", email: "iseyama@author.com" },
  { name: "Tsugumi Ohba", email: "ohba@author.com" },
  { name: "Akira Toriyama", email: "akira@author.com" },
];

try {
  await User.deleteMany({ role: "author" });
  console.log("🧹 Old authors removed");

  for (const a of authors) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.create({
      name: a.name,
      email: a.email,
      password: hashedPassword,
      role: "author",
      bio: `Author: ${a.name}`,
      books: [],
      awards: [],
      logoUrl: "",
    });
    console.log(`✅ Added author: ${a.name}`);
  }

  console.log("✅ Author seeding completed!");
  process.exit();
} catch (err) {
  console.error("❌ Error seeding authors:", err);
  process.exit(1);
}
