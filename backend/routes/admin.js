import express from 'express';
import Listing from '../models/listing.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all pending listings
router.get('/listings/pending', adminAuth, async (req, res) => {
    try {
        const listings = await Listing.find({ status: 'pending' }).populate('seller', 'name email');
        res.json(listings);
    } catch (err) {
        console.error("Error fetching pending listings:", err);
        res.status(500).json({ message: "Server error while fetching pending listings" });
    }
});

// Approve a listing
router.put('/listings/:id/approve', adminAuth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        listing.status = 'active';
        await listing.save();
        res.json(listing);
    } catch (err) {
        console.error("Error approving listing:", err);
        res.status(500).json({ message: "Server error while approving listing" });
    }
});

// Reject a listing
router.put('/listings/:id/reject', adminAuth, async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        listing.status = 'rejected';
        listing.rejectionReason = rejectionReason;
        await listing.save();
        res.json(listing);
    } catch (err) {
        console.error("Error rejecting listing:", err);
        res.status(500).json({ message: "Server error while rejecting listing" });
    }
});

export default router;
