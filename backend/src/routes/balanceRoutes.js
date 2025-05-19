import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getBalance, updateBalance } from "../controllers/balanceController.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getBalance);
router.put("/", updateBalance);

export default router;
