import express from "express";
import {
  createPlan,
  getPlans,
  deletePlan,
  updatePlan,
} from "../controllers/plan.controller.js";

const router = express.Router();

router.post("/create", createPlan);
router.get("/all", getPlans);
router.delete("/:id", deletePlan);
router.put("/:id", updatePlan);

export default router;
