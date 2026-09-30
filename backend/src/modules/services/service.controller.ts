import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import {
  validateCreateServiceInput,
  validateUpdateServiceInput
} from "./service.validation.js";

import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from "./service.service.js";


// ============================================================
// CREATE SERVICE
// POST /api/services
// ============================================================

export async function createServiceController(
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
      validateCreateServiceInput(req.body);

    const service =
      await createService(input);

    return res.status(201).json({
      message: "Service created successfully",
      service
    });

  } catch (error) {
    console.error(
      "Create service error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create service";

    if (
      message === "Owner not found"
    ) {
      return res.status(404).json({
        message
      });
    }

    if (
      message ===
      "Service with this name already exists"
    ) {
      return res.status(409).json({
        message
      });
    }

    return res.status(400).json({
      message
    });
  }
}


// ============================================================
// GET SERVICES
// GET /api/services
// ============================================================

export async function getServicesController(
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
      environment?: string;
      status?: string;
      ownerId?: string;
    } = {};

    if (
      typeof req.query.environment === "string"
    ) {
      filters.environment =
        req.query.environment;
    }

    if (
      typeof req.query.status === "string"
    ) {
      filters.status =
        req.query.status;
    }

    if (
      typeof req.query.ownerId === "string"
    ) {
      filters.ownerId =
        req.query.ownerId;
    }

    const services =
      await getServices(filters);

    return res.status(200).json({
      count: services.length,
      services
    });

  } catch (error) {
    console.error(
      "Get services error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch services"
    });
  }
}


// ============================================================
// GET SERVICE BY ID
// GET /api/services/:id
// ============================================================

export async function getServiceByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const serviceId =
      req.params.id;

    if (typeof serviceId !== "string") {
      return res.status(400).json({
        message: "Service ID is required"
      });
    }

    const service =
      await getServiceById(serviceId);

    return res.status(200).json({
      service
    });

  } catch (error) {
    console.error(
      "Get service error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch service";

    if (message === "Service not found") {
      return res.status(404).json({
        message
      });
    }

    return res.status(500).json({
      message
    });
  }
}


// ============================================================
// UPDATE SERVICE
// PATCH /api/services/:id
// ============================================================

export async function updateServiceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const serviceId =
      req.params.id;

    if (typeof serviceId !== "string") {
      return res.status(400).json({
        message: "Service ID is required"
      });
    }

    const input =
      validateUpdateServiceInput(
        req.body
      );

    const service =
      await updateService(
        serviceId,
        input
      );

    return res.status(200).json({
      message: "Service updated successfully",
      service
    });

  } catch (error) {
    console.error(
      "Update service error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update service";

    if (
      message === "Service not found" ||
      message === "Owner not found"
    ) {
      return res.status(404).json({
        message
      });
    }

    if (
      message ===
      "Service with this name already exists"
    ) {
      return res.status(409).json({
        message
      });
    }

    return res.status(400).json({
      message
    });
  }
}


// ============================================================
// DELETE SERVICE
// DELETE /api/services/:id
// ============================================================

export async function deleteServiceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const serviceId =
      req.params.id;

    if (typeof serviceId !== "string") {
      return res.status(400).json({
        message: "Service ID is required"
      });
    }

    await deleteService(serviceId);

    return res.status(200).json({
      message: "Service deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete service error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete service";

    if (message === "Service not found") {
      return res.status(404).json({
        message
      });
    }

    return res.status(500).json({
      message
    });
  }
}