import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createIncidentController,
  getIncidentsController,
  getIncidentByIdController,
  updateIncidentStatusController,
  assignIncidentController,
  createIncidentEventController,
  getIncidentSummaryController
} from "./incident.controller.js";

const router = Router();


// ============================================================
// CREATE INCIDENT
// POST /api/incidents
// ============================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createIncidentController
);


// ============================================================
// GET ALL INCIDENTS
// GET /api/incidents
// ============================================================

router.get(
  "/",
  authenticate,
  getIncidentsController
);



// ============================================================
// INCIDENT SUMMARY
// GET /api/incidents/summary
// ============================================================

router.get(
  "/summary",
  authenticate,
  getIncidentSummaryController
);
// ============================================================
// GET INCIDENT BY ID
// GET /api/incidents/:id
// ============================================================

router.get(
  "/:id",
  authenticate,
  getIncidentByIdController
);


// ============================================================
// UPDATE INCIDENT STATUS
// PATCH /api/incidents/:id/status
// ============================================================

router.patch(
    "/:id/status",
    authenticate,
    authorize("admin", "engineer"),
    updateIncidentStatusController
  );

// ============================================================
// ASSIGN INCIDENT
// PATCH /api/incidents/:id/assign
// ============================================================

router.patch(
  "/:id/assign",
  authenticate,
  authorize("admin", "engineer"),
  assignIncidentController
);

// ============================================================
// ADD INCIDENT EVENT
// POST /api/incidents/:id/events
// ============================================================

router.post(
  "/:id/events",
  authenticate,
  authorize("admin", "engineer"),
  createIncidentEventController
);

export default router;