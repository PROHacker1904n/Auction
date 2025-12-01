
import express from 'express';
import fetch from 'node-fetch';
import Listing from '../models/listing.js';

const router = express.Router();

// Get recommendations for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Call the Python ML service
    const mlServiceResponse = await fetch(`http://localhost:5001/recommendations/${userId}`);
    if (!mlServiceResponse.ok) {
      throw new Error(`ML service responded with status ${mlServiceResponse.status}`);
    }
    const recommendedListingIds = await mlServiceResponse.json();

    // Fetch the full listing details for the recommended IDs
    const recommendations = await Listing.find({ _id: { $in: recommendedListingIds } });

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
