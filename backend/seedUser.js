import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

dotenv.config();

const MONGO_URI = process.env.ATLASDB || "mongodb://localhost:27017/auction-app";

const seedUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      socketTimeoutMS: 30000,
    });
    console.log("✅ MongoDB Connected");

    const email = "test@example.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Test user already exists.");
    } else {
      const hashedPassword = await bcrypt.hash("password123", 12);
      const newUser = new User({
        name: "Test User",
        email,
        password: hashedPassword,
        gender: "other",
        urn: "12345",
        graduationYear: 2025,
      });

      await newUser.save();
      console.log("✅ Test user created successfully.");
      console.log("Email: test@example.com");
      console.log("Password: password123");
    }

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding user:", error);
    process.exit(1);
  }
};

seedUser();
