import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rated: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxLength: 500 },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure one rating per user per transaction
ratingSchema.index({ rater: 1, listing: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
