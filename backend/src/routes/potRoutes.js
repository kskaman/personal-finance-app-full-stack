import express from "express";
import {
  getPots,
  addPot,
  editPot,
  deletePot,
  addToPot,
  withdrawFromPot,
} from "../controllers/potsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate());

router.get("/", getPots);
router.post("/", addPot);
router.get("/:id", editPot);
router.delete("/:id", deletePot);
router.post("/:id/add", addToPot);
router.post("/:id/withdraw", withdrawFromPot);

export default router;
