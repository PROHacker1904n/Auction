
import express from 'express';
import fetch from 'node-fetch';
import Listing from '../models/listing.js';

const router = express.Router();

async function getFallbackListings() {
  // Combined logic for "Popular" (high interest) and "Live" (active)
  // Sort by bidCount descending (popular) and endTime ascending (ending soon)
  return Listing.find({ status: 'active' })
    .sort({ bidCount: -1, endTime: 1 }) 
    .limit(8)
    .populate('seller', 'username rating');
}

// Get recommendations for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Handle Guest / No User
    if (userId === 'guest' || userId === 'undefined' || userId === 'null') {
       const fallback = await getFallbackListings();
       return res.json(fallback);
    }

    // 2. Call the Python ML service for logged-in users
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
    try {
        const mlServiceResponse = await fetch(`${mlServiceUrl}/recommend/${userId}`);
        
        if (mlServiceResponse.ok) {
          const recommendationsData = await mlServiceResponse.json();
          // Extract IDs from the ML service response
          const recommendedIds = recommendationsData.map(item => item._id);
          
          // If ML service returns empty list (Cold Start), use fallback
          if (recommendedIds.length === 0) {
             const fallback = await getFallbackListings();
             return res.json(fallback);
          }

          // Fetch full listing details for recommended IDs
          const recommendations = await Listing.find({ 
            _id: { $in: recommendedIds },
            status: 'active' 
          }).populate('seller', 'username rating'); 
          
          // If after filtering for active status we have no items, use fallback
          if (recommendations.length === 0) {
             const fallback = await getFallbackListings();
             return res.json(fallback);
          }

          return res.json(recommendations);
        } else {
           console.warn(`ML Service unavailable or error: ${mlServiceResponse.status}`);
           const fallback = await getFallbackListings();
           return res.json(fallback);
        }
    } catch (fetchError) {
        console.error('Error calling ML service:', fetchError);
        // Fallback on connection error
        const fallback = await getFallbackListings();
        return res.json(fallback);
    }

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
