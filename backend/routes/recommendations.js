
import express from 'express';
import fetch from 'node-fetch';
import Listing from '../models/listing.js';
import User from '../models/user.js';

const router = express.Router();

// Helper to fetch fallback listings
async function getFallbackListings(limit = 8, excludeId = null) {
  const query = { status: 'active' };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Listing.find(query)
    .sort({ bidCount: -1, endTime: 1 }) 
    .limit(limit)
    .populate('seller', 'name rating');
}

// Get recommendations
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, listingId } = req.query; // Get category and current listing ID from query params

    let recommendations = [];

    // 1. Context-Aware Recommendation (e.g., on a specific Auction page)
    if (category) {
      const query = { 
        status: 'active', 
        category: category 
      };
      if (listingId) {
        query._id = { $ne: listingId }; // Exclude current listing
      }

      recommendations = await Listing.find(query)
        .sort({ bidCount: -1, endTime: 1 })
        .limit(8)
        .populate('seller', 'name rating');
      
      // If not enough category items, fill with fallbacks
      if (recommendations.length < 8) {
         const excludeIds = [listingId, ...recommendations.map(r => r._id)].filter(Boolean);
         const fillers = await getFallbackListings(8 - recommendations.length, excludeIds);
         // getFallbackListings doesn't accept array for exclude, so let's simple fetch extra and filter in memory or adjust query
         // For simplicity, just fetching popular ones ignoring duplicates check strictly for fill
         const extra = await Listing.find({ status: 'active', _id: { $nin: excludeIds } })
            .sort({ bidCount: -1 })
            .limit(8 - recommendations.length)
            .populate('seller', 'name rating');
         
         recommendations = [...recommendations, ...extra];
      }
      
      return res.json(recommendations);
    }

    // 2. User-Based Recommendation (Gender)
    if (userId && userId !== 'guest' && userId !== 'undefined' && userId !== 'null') {
      const user = await User.findById(userId);

      if (user && (user.gender === 'male' || user.gender === 'female')) {
        // Fetch items targeting specific gender + 'all'
        // Prioritize specific gender matches
        const genderQuery = {
            status: 'active',
            $or: [
                { targetGender: user.gender },
                { targetGender: 'all' }
            ]
        };

        recommendations = await Listing.find(genderQuery)
            .sort({ bidCount: -1, endTime: 1 }) // Sort by popularity/urgency
            .limit(8)
            .populate('seller', 'name rating');
        
        // Custom sorting to put exact gender match first if needed? 
        // MongoDB sort doesn't easily do "value match first", but we can do it in application logic if strict ordering needed.
        // For now, standard sort is fine as long as filtered correctly.
        
        if (recommendations.length > 0) {
            return res.json(recommendations);
        }
      }
    }

    // 3. Fallback / Guest
    const fallback = await getFallbackListings();
    return res.json(fallback);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
