import express from "express";
import Notification from "../models/notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get notifications for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;

    let query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedListing', 'title image')
      .populate('relatedUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put("/:notificationId/read", auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete("/:notificationId", auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notification preferences (placeholder for future implementation)
router.get("/preferences", auth, async (req, res) => {
  try {
    // This would typically come from user preferences
    const preferences = {
      emailNotifications: true,
      pushNotifications: true,
      bidNotifications: true,
      auctionEndNotifications: true,
      reviewNotifications: true,
      messageNotifications: true
    };

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update notification preferences (placeholder for future implementation)
router.put("/preferences", auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    // This would typically save to user preferences
    res.json({ message: "Preferences updated successfully", preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
