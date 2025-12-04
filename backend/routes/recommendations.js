
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
      
      // If not enough category items, fill with fallbacks (Gender-based or Generic)
      if (recommendations.length < 8) {
         const excludeIds = [listingId, ...recommendations.map(r => r._id)].filter(Boolean);
         const remainingCount = 8 - recommendations.length;

         let fillQuery = { 
             status: 'active', 
             _id: { $nin: excludeIds } 
         };

         // Try to use Gender preference for the fill if user is logged in
         if (userId && userId !== 'guest' && userId !== 'undefined' && userId !== 'null') {
             try {
                 const user = await User.findById(userId);
                 if (user && (user.gender === 'male' || user.gender === 'female')) {
                     fillQuery.$or = [
                         { targetGender: user.gender },
                         { targetGender: 'all' }
                     ];
                 }
             } catch (err) {
                 console.warn("Error fetching user for gender fallback:", err);
                 // Continue with generic fillQuery
             }
         }
         
         const extra = await Listing.find(fillQuery)
            .sort({ bidCount: -1, endTime: 1 })
            .limit(remainingCount)
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
