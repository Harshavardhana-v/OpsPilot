import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createServiceController,
  getServicesController,
  getServiceByIdController,
  updateServiceController,
  deleteServiceController
} from "./service.controller.js";


const router = Router();


// ============================================================
// CREATE SERVICE
// POST /api/services
// ============================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createServiceController
);


// ============================================================
// GET SERVICES
// GET /api/services
// ============================================================

router.get(
  "/",
  authenticate,
  getServicesController
);


// ============================================================
// GET SERVICE BY ID
// GET /api/services/:id
// ============================================================

router.get(
  "/:id",
  authenticate,
  getServiceByIdController
);


// ============================================================
// UPDATE SERVICE
// PATCH /api/services/:id
// ============================================================

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "engineer"),
  updateServiceController
);


// ============================================================
// DELETE SERVICE
// DELETE /api/services/:id
// ============================================================

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteServiceController
);


export default router;