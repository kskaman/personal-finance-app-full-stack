import express from "express";
import redis from "../redisClient.js";
import { body } from "express-validator";

import {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
  verifyReset,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

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
router.post("/signup", validateSignup, signup);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", validateEmail, resendVerification);
router.post(
  "/login",
  validateEmail.concat(
    body("password").notEmpty().withMessage("Password is required")
  ),
  login
);
router.post("/forgot-password", validateEmail, forgotPassword);

router.get("/verify-reset", verifyReset);

router.post("/reset-password", validateReset, resetPassword);

// Logout
router.post("/logout", authenticate, async (req, res) => {
  const sid = req.cookies.sid;
  if (sid) await redis.del(`SESSION:${sid}`);
  res.clearCookie("sid", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
});

export default router;
