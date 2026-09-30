import { Router } from "express";

import {
  authenticate,
  authorize
} from "../../middleware/auth.middleware.js";

import {
  createDeploymentController,
  getDeploymentsController,
  getDeploymentByIdController
} from "./deployment.controller.js";


const router = Router();


// ============================================================
// CREATE DEPLOYMENT
// POST /api/deployments
// ============================================================

router.post(
  "/",
  authenticate,
  authorize("admin", "engineer"),
  createDeploymentController
);


// ============================================================
// GET DEPLOYMENTS
// GET /api/deployments
// ============================================================

router.get(
  "/",
  authenticate,
  getDeploymentsController
);


// ============================================================
// GET DEPLOYMENT BY ID
// GET /api/deployments/:id
// ============================================================

router.get(
  "/:id",
  authenticate,
  getDeploymentByIdController
);


export default router;