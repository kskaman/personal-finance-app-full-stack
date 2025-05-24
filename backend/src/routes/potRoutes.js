import express from "express";
import {
  getPots,
  addPot,
  editPot,
  deletePot,
  potTransaction,
  getPotStats,
} from "../controllers/potsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getPots);
router.get("/stats", getPotStats);
router.post("/", addPot);

router.put("/:id", editPot);
router.delete("/:id", deletePot);
router.post("/:id/transactions", potTransaction);
export default router;
