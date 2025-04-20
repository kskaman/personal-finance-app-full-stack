// routes/budgetsRoutes.js
import { Router } from "express";

import {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetsController.js";

const router = Router();

router.get("/", getAllBudgets);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
