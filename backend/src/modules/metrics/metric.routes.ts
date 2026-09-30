import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createMetricController,
  getMetricsController,
  getMetricByIdController
} from "./metric.controller.js";

const router = Router();


// ============================================================
// CREATE METRIC
// POST /api/metrics
// ============================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createMetricController
);


// ============================================================
// GET ALL METRICS
// GET /api/metrics
// ============================================================

router.get(
  "/",
  authenticate,
  getMetricsController
);


// ============================================================
// GET METRIC BY ID
// GET /api/metrics/:id
// ============================================================

router.get(
  "/:id",
  authenticate,
  getMetricByIdController
);


export default router;