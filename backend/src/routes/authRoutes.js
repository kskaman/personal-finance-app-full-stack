import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Limit login attempts: max 5 per hour
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Try again in an hour." },
});

// Validation chains
const validateSignup = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 20 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/)
    .withMessage("Password must meet complexity requirements"),
];

const validateEmailOnly = [
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

// Routes
router.post("/signup", validateSignup, signup);
router.post("/verify-email", validateToken, verifyEmail);
router.post(
  "/login",
  validateEmailOnly.concat(
    body("password").notEmpty().withMessage("Password is required")
  ),
  login
);
router.post("/forgot-password", validateEmailOnly, forgotPassword);
router.post("/reset-password", validateReset, resetPassword);

export default router;
