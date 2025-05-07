import { Router } from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import settingRoutes from "./settingsRoute.js";
import categoryRoutes from "./categoryRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/settings", settingRoutes);
router.use("/categories", categoryRoutes);

export default router;
