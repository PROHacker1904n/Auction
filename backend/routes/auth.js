import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer"; // No longer needed
import User from "../models/user.js";
import PasswordReset from "../models/passwordReset.js";
import { Resend } from 'resend'; // Import Resend
import { validateEmail } from "../middleware/validation.js";

const router = express.Router();

// Helper function to send email
const sendEmail = async (email, otp) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY); // Initialize Resend with API key inside the function
    // Nodemailer transporter replaced by Resend API call
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's testing domain
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #007bff;">Password Reset Request</h2>
          <p>You requested a password reset. Please use the following OTP to proceed:</p>
          <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("Email sent via Resend to:", email, "Data:", data);
  } catch (error) {
    console.error("Resend Email Service Error:", error);
    throw new Error("Failed to send email");
  }
};

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, gender, urn, graduationYear } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create new user
    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      gender,
      urn,
      graduationYear
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }
    const cleanEmail = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter email" });
    }
    const cleanEmail = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    // First, clear any existing OTPs for this email
    await PasswordReset.deleteMany({ email: cleanEmail });
    
    const newReset = new PasswordReset({
      email: cleanEmail,
      otp
    });
    await newReset.save();

    // [DEV ONLY] Log OTP to console for testing
    console.log(`\n=== [DEV MODE] OTP for ${email}: ${otp} ===\n`);

    // Send Email
    try {
      await sendEmail(email, otp);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Please enter email and OTP" });
    }
    const cleanEmail = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const resetRecord = await PasswordReset.findOne({ email: cleanEmail, otp });
    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error during verification" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const cleanEmail = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Verify OTP again
    const resetRecord = await PasswordReset.findOne({ email: cleanEmail, otp });
    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update User password
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { password: hashedPassword }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the OTP record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

export default router;
