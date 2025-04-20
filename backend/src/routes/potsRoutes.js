// routes/potsRoutes.js
import { Router } from "express";
import {
  getAllPots,
  createPot,
  updatePot,
  deletePot,
} from "../controllers/potsController.js";

const router = Router();

router.get("/", getAllPots);
router.post("/", createPot);
router.put("/:id", updatePot);
router.delete("/:id", deletePot);

export default router;
