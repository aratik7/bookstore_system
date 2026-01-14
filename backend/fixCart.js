/* import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Book from "./models/Book.js";

dotenv.config();

const fixCart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const users = await User.find();

    for (const user of users) {
      let updatedCart = [];

      for (const item of user.cart) {
        // 🛡️ Skip null/invalid items
        if (!item || !item.book) continue;

        // If it's just ObjectId, wrap with quantity
        if (mongoose.Types.ObjectId.isValid(item)) {
          updatedCart.push({ book: item, quantity: 1 });
        } else if (item.book) {
          updatedCart.push({ book: item.book, quantity: item.quantity || 1 });
        }
      }

      user.cart = updatedCart;
      await user.save();

      console.log(`🛠 Fixed cart for user: ${user.email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing cart:", err);
    process.exit(1);
  }
};

fixCart();    */





import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const fixCart = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  const users = await User.find({});
  for (let user of users) {
    let before = user.cart.length;

    // filter out invalid cart entries
    user.cart = user.cart.filter(item => item.book);

    if (user.cart.length !== before) {
      await user.save();
      console.log(`🛠 Fixed cart for ${user.email}`);
    }
  }
  process.exit();
};

fixCart();
