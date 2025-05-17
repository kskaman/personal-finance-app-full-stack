// routes/transactionRoutes.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getTransactions); // ?page=1&pageSize=10&month=May 2025&catId=···&q=search
router.get("/:id", getTransaction);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
