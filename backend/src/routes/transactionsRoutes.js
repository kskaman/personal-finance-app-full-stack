// routes/transactionsRoutes.js
import { Router } from "express";

import {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionsController.js";
// If using an asyncHandler wrapper, you'd do:
// import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// GET /transactions
router.get("/", getAllTransactions);

// POST /transactions
router.post("/", createTransaction);

// PUT /transactions/:id
router.put("/:id", updateTransaction);

// DELETE /transactions/:id
router.delete("/:id", deleteTransaction);

export default router;
