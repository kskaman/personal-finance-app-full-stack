import express from "express";
import {
  getUserData,
  changePassword,
  updateName,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getCurrentUser,
  deleteCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/data", authenticate, getUserData);

router.get("/me", authenticate, getCurrentUser);
router.delete("/me", authenticate, deleteCurrentUser);
router.patch("/me/name", authenticate, updateName);
router.patch("/me/password", authenticate, changePassword);

export default router;
