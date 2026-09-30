import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import {
  validateCreateDeploymentInput
} from "./deployment.validation.js";

import {
  createDeployment,
  getDeployments,
  getDeploymentById
} from "./deployment.service.js";


// ============================================================
// CREATE DEPLOYMENT
// POST /api/deployments
// ============================================================

export async function createDeploymentController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }


    const input =
      validateCreateDeploymentInput(req.body);


    const deployment =
      await createDeployment(input);


    return res.status(201).json({
      message: "Deployment created successfully",
      deployment
    });

  } catch (error) {

    console.error(
      "Create deployment error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create deployment";


    if (
      message === "Service not found" ||
      message === "Deployed user not found"
    ) {
      return res.status(404).json({
        message
      });
    }


    return res.status(400).json({
      message
    });
  }
}


// ============================================================
// GET DEPLOYMENTS
// GET /api/deployments
// ============================================================

export async function getDeploymentsController(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }
  
      const filters: {
        serviceId?: string;
        status?: string;
        environment?: string;
      } = {};
  
      if (typeof req.query.serviceId === "string") {
        filters.serviceId = req.query.serviceId;
      }
  
      if (typeof req.query.status === "string") {
        filters.status = req.query.status;
      }
  
      if (typeof req.query.environment === "string") {
        filters.environment = req.query.environment;
      }
  
      const result = await getDeployments(filters);
  
      return res.status(200).json({
        count: result.length,
        deployments: result
      });
    } catch (error) {
      console.error(
        "Get deployments error:",
        error
      );
  
      return res.status(500).json({
        message: "Failed to fetch deployments"
      });
    }
  }

// ============================================================
// GET DEPLOYMENT BY ID
// GET /api/deployments/:id
// ============================================================

export async function getDeploymentByIdController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }


    const deploymentId =
      req.params.id;


    if (typeof deploymentId !== "string") {
      return res.status(400).json({
        message: "Deployment ID is required"
      });
    }


    const deployment =
      await getDeploymentById(
        deploymentId
      );


    return res.status(200).json({
      deployment
    });

  } catch (error) {

    console.error(
      "Get deployment error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch deployment";


    if (message === "Deployment not found") {
      return res.status(404).json({
        message
      });
    }


    return res.status(500).json({
      message: "Failed to fetch deployment"
    });
  }
}