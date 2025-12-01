import express from 'express';
import User from '../models/user.js';
import Bid from '../models/bid.js';
import Listing from '../models/listing.js';
import auth from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get user details
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Server error while fetching user" });
    }
});

// Update user details
router.put('/:id', auth, async (req, res) => {
    try {
        const { gender, graduationYear } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to edit this profile' });
        }

        user.gender = gender;
        user.graduationYear = graduationYear;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Server error while updating user" });
    }
});

// Update profile picture
router.put('/:id/profile-picture', auth, async (req, res) => {
    try {
        const { profileImage } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to edit this profile' });
        }

        user.profileImage = profileImage;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error("Error updating profile picture:", err);
        res.status(500).json({ message: "Server error while updating profile picture" });
    }
});

// Change password
router.put('/:id/password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to change this password' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Server error while changing password" });
    }
});

// Get all bids by a user
router.get('/:id/bids', async (req, res) => {
    try {
        const bids = await Bid.find({ bidder: req.params.id }).populate('listing', 'title');
        res.json(bids);
    } catch (err) {
        console.error("Error fetching user bids:", err);
        res.status(500).json({ message: "Server error while fetching user bids" });
    }
});

// Get all listings won by a user
router.get('/:id/won-listings', async (req, res) => {
    try {
        const listings = await Listing.find({ winner: req.params.id });
        res.json(listings);
    } catch (err) {
        console.error("Error fetching won listings:", err);
        res.status(500).json({ message: "Server error while fetching won listings" });
    }
});

export default router;
