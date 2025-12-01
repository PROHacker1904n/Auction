import express from "express";
import Review from "../models/review.js";
import User from "../models/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get reviews for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest_rated':
        sort = { rating: -1 };
        break;
      case 'lowest_rated':
        sort = { rating: 1 };
        break;
      case 'most_helpful':
        sort = { helpfulVotes: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find({ reviewed: userId })
      .populate('reviewer', 'name profileImage rating')
      .populate('listing', 'title image')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewed: userId });

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { reviewed: userId } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averageRating: avgRating[0]?.average || 0,
      totalReviews: avgRating[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a review
router.post("/", auth, async (req, res) => {
  try {
    const { reviewedUserId, listingId, rating, title, content, isAnonymous } = req.body;
    const reviewerId = req.user.id;

    // Check if already reviewed
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      listing: listingId
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this listing" });
    }

    const newReview = new Review({
      reviewer: reviewerId,
      reviewed: reviewedUserId,
      listing: listingId,
      rating,
      title,
      content,
      isAnonymous
    });

    await newReview.save();

    // Update user's trust score
    await updateUserTrustScore(reviewedUserId);

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.put("/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content } = req.body;
    const userId = req.user.id;

    const existingReview = await Review.findOne({
      _id: reviewId,
      reviewer: userId
    });

    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    existingReview.rating = rating;
    existingReview.title = title;
    existingReview.content = content;
    await existingReview.save();

    // Update user's trust score
    await updateUserTrustScore(existingReview.reviewed);

    res.json(existingReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review
router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      reviewer: userId
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update user's trust score
    await updateUserTrustScore(review.reviewed);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on review helpfulness
router.post("/:reviewId/vote", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (helpful) {
      review.helpfulVotes += 1;
    } else {
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    }

    await review.save();
    res.json({ helpfulVotes: review.helpfulVotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to a review (seller response)
router.post("/:reviewId/respond", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId)
      .populate('listing', 'seller');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.listing.seller.toString() !== userId) {
      return res.status(403).json({ message: "Only the seller can respond to reviews" });
    }

    review.response = {
      content: response,
      respondedAt: new Date()
    };

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update user's trust score
async function updateUserTrustScore(userId) {
  const reviews = await Review.find({ reviewed: userId });
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) return;

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const helpfulReviews = reviews.filter(review => review.helpfulVotes > 0).length;
  const helpfulnessRatio = helpfulReviews / totalReviews;

  // Calculate trust score based on rating and helpfulness
  const trustScore = Math.min(100, Math.max(0, 
    (averageRating / 5) * 60 + // 60% based on average rating
    helpfulnessRatio * 40      // 40% based on helpfulness
  ));

  await User.findByIdAndUpdate(userId, { trustScore: Math.round(trustScore) });
}

export default router;
