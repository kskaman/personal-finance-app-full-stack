import dotenv from "dotenv";
dotenv.config();

import { addHours } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "../redisClient.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Signup: create user + nested settings & balance + email verification token
 */
export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if email already exists
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(400).json({
        message: "Email already registered.",
      });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = addHours(new Date(), 12); // Token valid for 12h

    // 4. Create user with default settings and balance
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
        settings: {
          create: {
            font: "public_sans",
            currency: "us_dollar",
            pots: true,
            bills: true,
            budgets: true,
          },
        },
        balance: {
          create: { current: 0, income: 0, expenses: 0 },
        },
      },
    });

    // 5. Send verification email
    const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?t=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `<p>Welcome, ! Please verify your email by clicking
             <a href="${verifyLink}">here</a>. This link expires within 12 hours.</p>`,
    });

    return res.status(201).json({
      message: "Signup successful. Check your email to verify.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Verify Email: activate account if token is valid & unexpired
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.query.t;
  try {
    // 1. Find user by token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link." });
    }

    // 2. Check if user is already verified
    if (user.isVerified) {
      return res
        .status(409)
        .json({ message: "Account is already verified. Please log in." });
    }

    // 3. Mark user as verified and clear tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
  } catch (err) {
    console.error("Verify Email error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  const generic =
    "If this email is registered you'll receive email with verification link.";

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) return res.json({ message: generic });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = addHours(new Date(), 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExpiry },
    });

    const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?t=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify your e-mail",
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your account. This link expires within 12 hours.</p>`,
    });

    return res.json({ message: generic });
  } catch (e) {
    console.error("resendVerification error:", e);
    return res.status(500).json({ message: generic });
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

    // 4. Create session id and store in Redis (4 h)
    const sid = uuidv4();
    await redis.set(`SESSION:${sid}`, user.id, { EX: 60 * 60 * 4 });

    // 5. http-only cookie
    res.cookie("sid", sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 4, // 4 h
    });

    return res.json({ message: "Logged in successfully." });
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
    const resetLink = `${process.env.BACKEND_URL}/api/auth/verify-reset?t=${resetToken}`;
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

// GET /api/auth/verify-reset?t=LONG_TOKEN
export const verifyReset = async (req, res) => {
  const token = req.query.t;
  if (!token) return res.status(400).send("Missing token");

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) return res.status(400).send("Invalid or expired link");

  // invalidate long token so it can’t be reused
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: null, resetTokenExpiry: null },
  });

  // create short-lived sid (1 hr)
  const sid = uuidv4();
  await redis.set(`SESSION_RESET:${sid}`, user.id, { EX: 60 * 60 });

  // redirect to front-end without revealing long token
  return res.redirect(
    `${process.env.FRONTEND_URL}/auth/reset-password?sid=${sid}`
  );
};

/**
 * Reset Password: validate token, hash new password, clear token fields
 */
export const resetPassword = async (req, res) => {
  const { sid, newPassword } = req.body;
  if (!sid) return res.status(400).json({ message: "Missing reset session." });

  const userId = await redis.get(`SESSION_RESET:${sid}`);
  if (!userId) {
    return res.status(400).json({ message: "Reset session expired." });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  await redis.del(`SESSION_RESET:${sid}`); // one-time use
  res.json({ message: "Password changed." });
};

/**
 * GET current user: /api/users/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        isVerified: true,
      },
    });
    return res.json(user);
  } catch (e) {
    console.error("me error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};
