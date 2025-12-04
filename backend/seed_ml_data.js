import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.js";
import Listing from "./models/listing.js";
import Bid from "./models/bid.js";

dotenv.config();

const MONGO_URI = process.env.ATLASDB || "mongodb://localhost:27017/auction-app";

const seedMLData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Create Users
    const password = await bcrypt.hash("password123", 10);
    
    const targetUser = await User.create({
      name: "Target User",
      email: `target_${Date.now()}@test.com`,
      password,
      gender: "male",
      urn: `TARGET_${Date.now()}`,
      graduationYear: 2025,
      role: "user"
    });

    const similarUser = await User.create({
      name: "Similar User",
      email: `similar_${Date.now()}@test.com`,
      password,
      gender: "female",
      urn: `SIMILAR_${Date.now()}`,
      graduationYear: 2025,
      role: "user"
    });

    console.log(`Created Users: Target (${targetUser._id}), Similar (${similarUser._id})`);

    // 2. Create Listings
    const startTime = new Date();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const item1 = await Listing.create({
      title: "ML Test Item - Shared Interest",
      description: "Both users will bid on this item.",
      startPrice: 10,
      currentBid: 10,
      startTime,
      endTime,
      seller: similarUser._id, // Doesn't matter much
      image: "placeholder",
      status: "active",
      category: "stationary",
      condition: "new",
      targetGender: "all"
    });

    const item2 = await Listing.create({
      title: "ML Test Item - Recommendation",
      description: "Only Similar User bids on this. Should be recommended to Target User.",
      startPrice: 20,
      currentBid: 20,
      startTime,
      endTime,
      seller: targetUser._id,
      image: "placeholder",
      status: "active",
      category: "electronics",
      condition: "new",
      targetGender: "all"
    });

    console.log(`Created Listings: Item1 (${item1._id}), Item2 (${item2._id})`);

    // 3. Create Bids
    // Both users bid on Item 1
    await Bid.create({ amount: 15, bidder: targetUser._id, listing: item1._id });
    await Bid.create({ amount: 20, bidder: similarUser._id, listing: item1._id });

    // Only Similar User bids on Item 2
    await Bid.create({ amount: 25, bidder: similarUser._id, listing: item2._id });

    console.log("✅ Bids placed.");
    console.log("---------------------------------------------------");
    console.log("To test recommendations, log in as:");
    console.log(`Email: ${targetUser.email}`);
    console.log(`Password: password123`);
    console.log("---------------------------------------------------");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding ML data:", error);
    process.exit(1);
  }
};

seedMLData();
