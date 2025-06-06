import { Router } from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import settingRoutes from "./settingsRoute.js";
import categoryRoutes from "./categoryRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import billRoutes from "./billRoutes.js";
import potRoutes from "./potRoutes.js";
import balanceRoutes from "./balanceRoutes.js";
import budgetRoutes from "./budgetRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/settings", settingRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/bills", billRoutes);
router.use("/pots", potRoutes);
router.use("/balance", balanceRoutes);
router.use("/budgets", budgetRoutes);

export default router;
