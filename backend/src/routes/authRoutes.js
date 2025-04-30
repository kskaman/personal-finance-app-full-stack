import express from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../redisClient.js";
import { body } from "express-validator";

import {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  resendVerification,
  verifyReset,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// ——— Specific rate limiters ———
// throttle login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
  message: { message: "Too many attempts. Try again in an hour." },
});

// throttle sign-ups (optional, e.g. 5 per hour)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests. Try again later." },
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
});

// throttle password resets (optional, e.g. 5 per hour)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
  message: { message: "Too many requests. Try again later." },
});

// ——— Validation chains ———
const validateSignup = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 20 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/)
    .withMessage("Password must meet complexity requirements"),
];

const validateEmail = [
  body("email").isEmail().withMessage("Enter a valid email"),
];

const validateToken = [
  body("token").notEmpty().withMessage("Token is required"),
];

const validateReset = [
  ...validateToken,
  body("newPassword")
    .isLength({ min: 8, max: 20 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/)
    .withMessage("Password must meet complexity requirements"),
];

// ——— Routes ———

// Public endpoints
router.post("/signup", signupLimiter, validateSignup, signup);
router.get("/verify-email", verifyEmail);
router.post(
  "/resend-verification",
  loginLimiter,
  validateEmail,
  resendVerification
);
router.post(
  "/login",
  loginLimiter,
  validateEmail.concat(
    body("password").notEmpty().withMessage("Password is required")
  ),
  login
);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateEmail,
  forgotPassword
);

router.get("/verify-reset", verifyReset);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validateReset,
  resetPassword
);

// Protected endpoints
router.get("/users/me", authenticate, getCurrentUser);

// Logout
router.post("/logout", authenticate, async (req, res) => {
  const sid = req.cookies.sid;
  if (sid) await redis.del(`SESSION:${sid}`);
  res.clearCookie("sid", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
});

export default router;
