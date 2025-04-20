import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { addHours } from "date-fns";
import { sendEmail } from "../utils/sendEmail.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Utility: generate JWT
const generateToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });

/**
 * Signup: create user + nested settings & balance + email verification token
 */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if email already exists
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(400).json({
        message: "Check your email for verification instructions.",
      });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = addHours(new Date(), 12); // Token valid for 12h

    // 4. Create user with default settings and balance
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
        settings: {
          create: {
            font: "public_sans",
            currency: "us_dollar",
            displayedPots: true,
            displayedRecurringBills: true,
            displayedBudgets: true,
          },
        },
        balance: {
          create: { current: 0, income: 0, expenses: 0 },
        },
      },
    });

    // 5. Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `<p>Welcome, ${name}! Please verify your email by clicking
             <a href="${verifyLink}">here</a>.</p>`,
    });

    return res.status(201).json({
      message:
        "Signup successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * Verify Email: activate account if token is valid & unexpired
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    // 1. Find user by token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link." });
    }

    // 2. Mark user as verified and clear tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Verify Email error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * Login: only allow if email is verified
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 3. Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id);

    return res.json({ message: "Logged in successfully.", token });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * Forgot Password: generate & email reset token
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const genericMsg =
      "If your email is registered, you will receive a password reset link shortly.";

    // Always respond the same for security reasons
    if (!user) {
      return res.json({ message: genericMsg });
    }

    // 1. Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = addHours(new Date(), 1); // Token valid for 1h

    // 2. Save reset token to user
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // 3. Send reset password email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    return res.json({ message: genericMsg });
  } catch (err) {
    console.error("Forgot Password error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * Reset Password: validate token, hash new password, clear token fields
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // 1. Find user by reset token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset link." });
    }

    // 2. Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // 3. Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return res.json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Reset Password error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
