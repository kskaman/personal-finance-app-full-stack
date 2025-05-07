import express from "express";
import {
  getAllCategories,
  getCategory,
  createCategory,
  renameCategory,
  toggleUsedInBudgets,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

// List all categories for the logged‑in user
router.get("/", getAllCategories);

// Get one category by link‑ID
router.get("/:id", getCategory);

// Create a new custom category
router.post("/", createCategory);

// Rename an existing custom category
router.put("/:id", renameCategory);

// Toggle the usedInBudgets flag
router.patch("/:id/flag", toggleUsedInBudgets);

// Delete a custom category
router.delete("/:id", deleteCategory);

export default router;
