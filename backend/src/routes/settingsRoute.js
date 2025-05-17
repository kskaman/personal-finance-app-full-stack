import express from "express";
import { updateSettings } from "../controllers/settingsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/", authenticate, updateSettings);

export default router;
