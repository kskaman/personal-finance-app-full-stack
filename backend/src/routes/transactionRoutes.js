// routes/transactionRoutes.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getTransactions,
  getLatestTransactions,
  getTransaction,
  getTransactionMeta,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyTransactionsByCategoryNames,
} from "../controllers/transactionController.js";

const router = express.Router();
router.use(authenticate);

router.get("/meta", getTransactionMeta);
router.post("/budgetCategories", getMonthlyTransactionsByCategoryNames);
router.get("/latest", getLatestTransactions);

router.get("/", getTransactions);
router.get("/:id", getTransaction);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
