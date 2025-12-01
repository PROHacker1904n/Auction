import express from "express";
import Rating from "../models/rating.js";
import User from "../models/user.js";
import Listing from "../models/listing.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get ratings for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ rated: userId })
      .populate('rater', 'name profileImage')
      .populate('listing', 'title image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ rated: userId });

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a rating
router.post("/", auth, async (req, res) => {
  try {
    const { ratedUserId, listingId, rating, comment, isAnonymous } = req.body;
    const raterId = req.user.id;

    // Check if already rated
    const existingRating = await Rating.findOne({
      rater: raterId,
      listing: listingId
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this listing" });
    }

    const newRating = new Rating({
      rater: raterId,
      rated: ratedUserId,
      listing: listingId,
      rating,
      comment,
      isAnonymous
    });

    await newRating.save();

    // Update user's average rating
    await updateUserRating(ratedUserId);

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a rating
router.put("/:ratingId", auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const existingRating = await Rating.findOne({
      _id: ratingId,
      rater: userId
    });

    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    existingRating.rating = rating;
    existingRating.comment = comment;
    await existingRating.save();

    // Update user's average rating
    await updateUserRating(existingRating.rated);

    res.json(existingRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a rating
router.delete("/:ratingId", auth, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOneAndDelete({
      _id: ratingId,
      rater: userId
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Update user's average rating
    await updateUserRating(rating.rated);

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update user's average rating
async function updateUserRating(userId) {
  const ratings = await Rating.find({ rated: userId });
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
    : 0;

  await User.findByIdAndUpdate(userId, {
    rating: Math.round(averageRating * 10) / 10,
    totalRatings
  });
}

export default router;
