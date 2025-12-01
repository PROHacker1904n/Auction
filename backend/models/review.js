import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewed: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxLength: 100 },
    content: { type: String, required: true, maxLength: 1000 },
    isVerified: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    isAnonymous: { type: Boolean, default: false },
    response: {
      content: { type: String, maxLength: 500 },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);



export default mongoose.model("Review", reviewSchema);
