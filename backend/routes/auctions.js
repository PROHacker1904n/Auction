import express from "express";
import Bid from "../models/bid.js";
import Listing from "../models/listing.js";
import Notification from "../models/notification.js";
import auth from "../middleware/auth.js";

import { biddingLimiter } from "../middleware/security-simple.js";

const router = express.Router();

// Get all bids for a listing
router.get("/:listingId/bids", async (req, res) => {
  try {
    const { listingId } = req.params;
    const bids = await Bid.find({ listing: listingId })
      .populate("bidder", "name")
      .sort({ amount: -1 });
    res.json(bids);
  } catch (err) {
    console.error("Error fetching bids:", err);
    res.status(500).json({ message: "Server error while fetching bids" });
  }
});

// Place a bid on a listing
router.post("/:listingId/bids", auth, biddingLimiter, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { amount } = req.body;
    const bidderId = req.user.id;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: "This auction is not active." });
    }

    // Prevent user from bidding on their own listing
    if (listing.seller.toString() === bidderId) {
      return res.status(403).json({ message: "You cannot bid on your own listing" });
    }

    if (amount <= listing.currentBid) {
      return res.status(400).json({ message: "Your bid must be higher than the current bid" });
    }

    const newBid = new Bid({
      amount,
      bidder: bidderId,
      listing: listingId,
    });

    await newBid.save();

    listing.currentBid = amount;
    listing.highestBidder = bidderId;
    listing.bidCount = (listing.bidCount || 0) + 1;
    await listing.save();

    // Notify previous highest bidder if they were outbid
    if (listing.highestBidder && listing.highestBidder.toString() !== bidderId) {
      await createNotification(
        listing.highestBidder,
        'bid_outbid',
        'You\'ve been outbid!',
        `Your bid on "${listing.title}" has been outbid. Current bid: $${amount}`,
        listingId,
        bidderId
      );
    }

    // Notify seller about new bid
    await createNotification(
      listing.seller,
      'bid_placed',
      'New Bid Placed',
      `A new bid of $${amount} has been placed on "${listing.title}"`,
      listingId,
      bidderId
    );

    res.status(201).json({ message: "Bid placed successfully", listing });
  } catch (err) {
    console.error("Bidding Error:", err);
    res.status(500).json({ message: "Server error while placing bid" });
  }
});

// Helper function to create notifications
async function createNotification(userId, type, title, message, relatedListing, relatedUser) {
  const notification = new Notification({
    user: userId,
    type,
    title,
    message,
    relatedListing,
    relatedUser
  });

  await notification.save();
}

export default router;
