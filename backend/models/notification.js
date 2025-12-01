import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      required: true,
      enum: [
        'bid_placed',
        'bid_outbid',
        'auction_won',
        'auction_ended',
        'auction_started',
        'new_review',
        'rating_received',
        'message_received',
        'auction_reminder',
        'payment_required',
        'item_shipped',
        'item_delivered',
        'dispute_opened',
        'account_verified',
        'security_alert'
      ]
    },
    title: { type: String, required: true, maxLength: 100 },
    message: { type: String, required: true, maxLength: 500 },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actionUrl: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
