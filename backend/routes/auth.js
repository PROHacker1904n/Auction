import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.js";
import PasswordReset from "../models/passwordReset.js";

const router = express.Router();

// Helper function to send email
const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail App Password
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address, usually your Gmail
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
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent via Gmail to:", email);
  } catch (error) {
    console.error("Gmail Email Service Error:", error);
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

    // 2. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create new user
    const newUser = new User({
      name,
      email,
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
    const user = await User.findOne({ email });
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    // First, clear any existing OTPs for this email
    await PasswordReset.deleteMany({ email });
    
    const newReset = new PasswordReset({
      email,
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
    
    const resetRecord = await PasswordReset.findOne({ email, otp });
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

    // Verify OTP again
    const resetRecord = await PasswordReset.findOne({ email, otp });
    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update User password
    const user = await User.findOneAndUpdate(
      { email },
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
