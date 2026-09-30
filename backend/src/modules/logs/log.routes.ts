import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createLogController,
  getLogsController,
  getLogByIdController
} from "./log.controller.js";


const router = Router();


// ============================================================
// CREATE LOG
// POST /api/logs
// ============================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createLogController
);


// ============================================================
// GET LOGS
// GET /api/logs
// ============================================================

router.get(
  "/",
  authenticate,
  getLogsController
);


// ============================================================
// GET LOG BY ID
// GET /api/logs/:id
// ============================================================

router.get(
  "/:id",
  authenticate,
  getLogByIdController
);


export default router;