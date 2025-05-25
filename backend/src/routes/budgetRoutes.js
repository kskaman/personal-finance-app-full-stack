import express from "express";
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetStats,
} from "../controllers/budgetsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getBudgets);
router.post("/stats", getBudgetStats);
router.post("/", addBudget);
router.patch("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
