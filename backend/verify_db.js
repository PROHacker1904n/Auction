import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Listing from "./models/listing.js";

dotenv.config();

const MONGO_URI = process.env.ATLASDB || "mongodb://localhost:27017/auction-app";

const verifyEmpty = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Listings: ${listingCount}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error("Error verifying:", error);
  }
};

verifyEmpty();
