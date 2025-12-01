import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportedListing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    type: { 
      type: String, 
      required: true,
      enum: [
        'fraud',
        'fake_item',
        'inappropriate_content',
        'harassment',
        'spam',
        'scam',
        'payment_issue',
        'shipping_issue',
        'other'
      ]
    },
    reason: { type: String, required: true, maxLength: 500 },
    description: { type: String, maxLength: 1000 },
    status: { 
      type: String, 
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending'
    },
    adminNotes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    evidence: [{ type: String }], // URLs to evidence files
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
