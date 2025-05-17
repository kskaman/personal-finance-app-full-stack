import express from "express";
import {
  getBills,
  getBill,
  addBill,
  editBill,
  deleteBill,
  billStats,
} from "../controllers/billsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getBills);
router.get("/stats", billStats);
router.get("/:id", getBill);
router.post("/", addBill);
router.put("/:id", editBill);
router.delete("/:id", deleteBill);

export default router;
