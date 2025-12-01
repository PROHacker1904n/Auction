import express from "express";
import Report from "../models/report.js";
import User from "../models/user.js";
import Listing from "../models/listing.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create a report
router.post("/", auth, async (req, res) => {
  try {
    const { reportedUserId, reportedListingId, type, reason, description, evidence } = req.body;
    const reporterId = req.user.id;

    // Validate that either user or listing is reported
    if (!reportedUserId && !reportedListingId) {
      return res.status(400).json({ message: "Must report either a user or listing" });
    }

    // Check if user exists
    if (reportedUserId) {
      const user = await User.findById(reportedUserId);
      if (!user) {
        return res.status(404).json({ message: "Reported user not found" });
      }
    }

    // Check if listing exists
    if (reportedListingId) {
      const listing = await Listing.findById(reportedListingId);
      if (!listing) {
        return res.status(404).json({ message: "Reported listing not found" });
      }
    }

    // Check if user is reporting themselves
    if (reportedUserId && reportedUserId === reporterId) {
      return res.status(400).json({ message: "Cannot report yourself" });
    }

    const report = new Report({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reportedListing: reportedListingId,
      type,
      reason,
      description,
      evidence
    });

    await report.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports (admin only - placeholder)
router.get("/", auth, async (req, res) => {
  try {
    // This would typically check for admin role
    const { page = 1, limit = 20, status, type } = req.query;

    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedListing', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific report
router.get("/:reportId", auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findById(reportId)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedListing', 'title image');

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only allow reporter or admin to view report
    if (report.reporter._id.toString() !== userId) {
      // This would typically check for admin role
      return res.status(403).json({ message: "Not authorized to view this report" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report status (admin only - placeholder)
router.put("/:reportId/status", auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const userId = req.user.id;

    // This would typically check for admin role
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        adminNotes,
        resolvedAt: status === 'resolved' ? new Date() : null,
        resolvedBy: status === 'resolved' ? userId : null
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
