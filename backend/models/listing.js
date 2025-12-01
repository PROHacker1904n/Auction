import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startPrice: { type: Number, required: true },
    currentBid: { type: Number, default: function() { return this.startPrice; } },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'ended', 'completed', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: String, required: true },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], required: true },
    targetGender: { type: String, enum: ['male', 'female', 'all'], default: 'all' },
    isVerified: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    bidCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export default mongoose.model("Listing", listingSchema);
