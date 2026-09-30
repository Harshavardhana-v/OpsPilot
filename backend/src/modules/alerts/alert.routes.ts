import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createAlertRuleController,
  getAlertRulesController,
  getAlertRuleByIdController,
  updateAlertRuleEnabledController,
  getActiveAlertsController,
  getAlertByIdController,
  resolveAlertController
} from "./alert.controller.js";

const router = Router();

// ============================================================
// ALERT RULES
// ============================================================

// CREATE ALERT RULE
// POST /api/alerts
router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createAlertRuleController
);

// GET ALL ALERT RULES
// GET /api/alerts
router.get(
  "/",
  authenticate,
  getAlertRulesController
);

// GET ALERT RULE BY ID
// GET /api/alerts/rules/:id
router.get(
  "/rules/:id",
  authenticate,
  getAlertRuleByIdController
);

// ENABLE / DISABLE ALERT RULE
// PATCH /api/alerts/rules/:id/enabled
router.patch(
  "/rules/:id/enabled",
  authenticate,
  authorize("admin", "engineer"),
  updateAlertRuleEnabledController
);

// ============================================================
// ACTUAL TRIGGERED ALERTS
// ============================================================

// GET ACTIVE ALERTS
// GET /api/alerts/active
router.get(
  "/active",
  authenticate,
  getActiveAlertsController
);

// GET ACTUAL ALERT BY ID
// GET /api/alerts/record/:id
router.get(
  "/record/:id",
  authenticate,
  getAlertByIdController
);

// RESOLVE ACTUAL ALERT
// PATCH /api/alerts/record/:id/resolve
router.patch(
  "/record/:id/resolve",
  authenticate,
  authorize("admin", "engineer"),
  resolveAlertController
);

export default router;