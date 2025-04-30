import express from "express";
import { getUserData } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/data", authenticate, getUserData);

export default router;
