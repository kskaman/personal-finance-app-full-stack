import express from "express";
import {
  updateFont,
  updateCurrency,
  updateDisplayedBills,
  updateDisplayedPots,
  updateDisplayedBudgets,
} from "../controllers/settingsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/font", authenticate, updateFont);
router.put("/currency", authenticate, updateCurrency);

router.put("/displayedPots", authenticate, updateDisplayedPots);
router.put("/displayedBills", authenticate, updateDisplayedBills);
router.put("/displayedBudgets", authenticate, updateDisplayedBudgets);

export default router;
