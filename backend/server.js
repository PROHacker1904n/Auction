import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";
import Listing from "./models/listing.js";
import Notification from "./models/notification.js";
import { 
  generalLimiter, 
  authLimiter, 
  biddingLimiter
} from "./middleware/security-simple.js";

import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import auctionRoutes from "./routes/auctions.js";
import ratingRoutes from "./routes/ratings.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";

import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import recommendationsRoutes from "./routes/recommendations.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const MONGO_URI = process.env.ATLASDB || "mongodb://localhost:27017/auction-app"
const app = express();

// Basic security middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Input sanitization middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // Basic XSS protection
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          obj[key] = obj[key].replace(/javascript:/gi, '');
          obj[key] = obj[key].replace(/on\w+\s*=/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

// Rate limiting
app.use(generalLimiter);

// CORS configuration
// CORS configuration - Allow React app
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    socketTimeoutMS: 30000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Intelligent Auction Platform API is running...");
});

// Apply specific rate limiting to routes
app.use("/api/auth", authLimiter);


app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationsRoutes);

// Cron job to check for auction status changes every minute
cron.schedule('* * * * *', async () => {
  console.log('Running a check for auction status changes...');
  try {
    // Use UTC for all date comparisons to avoid timezone issues
    const now = new Date(new Date().toUTCString());
    
    // Start pending auctions
    const pendingAuctions = await Listing.find({ startTime: { $lte: now }, status: 'pending' });
    for (const auction of pendingAuctions) {
      auction.status = 'active';
      await auction.save();
      console.log(`Auction for "${auction.title}" has started.`);
    }

    // End active auctions
    const activeAuctions = await Listing.find({ endTime: { $lte: now }, status: 'active' });
    for (const auction of activeAuctions) {
      auction.status = 'ended';
      auction.winner = auction.highestBidder; // Set the winner
      await auction.save();
      console.log(`Auction for "${auction.title}" has ended. Winner: ${auction.winner}`);

      // Create notifications for auction end
      if (auction.highestBidder) {
        // Notify winner
        await createNotification(
          auction.highestBidder,
          'auction_won',
          'Auction Won!',
          `Congratulations! You won the auction for "${auction.title}" with a bid of $${auction.currentBid}`,
          auction._id,
          auction.seller
        );

        // Notify seller
        await createNotification(
          auction.seller,
          'auction_ended',
          'Auction Ended',
          `Your auction "${auction.title}" has ended. Winner: ${auction.highestBidder}`,
          auction._id,
          auction.highestBidder
        );
      } else {
        // No bids - notify seller
        await createNotification(
          auction.seller,
          'auction_ended',
          'Auction Ended - No Bids',
          `Your auction "${auction.title}" has ended with no bids`,
          auction._id,
          null
        );
      }
    }
  } catch (error) {
    console.error('Error updating auction statuses:', error);
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
