import express from "express";
import {
  getAllCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

// List all categories for the logged‑in user
router.get("/", getAllCategories);

// Create a new custom category
router.post("/", createCategory);

// Rename an existing custom category
router.put("/:id", renameCategory);

// Delete a custom category
router.delete("/:id", deleteCategory);

export default router;
