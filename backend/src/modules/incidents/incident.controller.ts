import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import {
  validateCreateIncidentInput,
  validateUpdateIncidentStatusInput,
  validateAssignIncidentInput,
  validateCreateIncidentEventInput
} from "./incident.validation.js";

import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  assignIncident,
  createIncidentEvent,
  getIncidentSummary
} from "./incident.service.js";


// ============================================================
// CREATE INCIDENT
// POST /api/incidents
// ============================================================

export async function createIncidentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const input = validateCreateIncidentInput(req.body);

    const incident = await createIncident(
      input,
      req.user.userId
    );

    return res.status(201).json({
      message: "Incident created successfully",
      incident
    });

  } catch (error) {
    console.error("Create incident error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create incident";

    if (
      message === "Service not found" ||
      message === "Assigned user not found"
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
// GET ALL INCIDENTS
// GET /api/incidents
// ============================================================

export async function getIncidentsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 10;

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        message: "page must be a positive integer"
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "limit must be between 1 and 100"
      });
    }

    const result = await getIncidents({
      status:
        typeof req.query.status === "string"
          ? req.query.status
          : undefined,

      severity:
        typeof req.query.severity === "string"
          ? req.query.severity
          : undefined,

      serviceId:
        typeof req.query.serviceId === "string"
          ? req.query.serviceId
          : undefined,

      page,
      limit
    });

    return res.status(200).json({
      count: result.incidents.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      incidents: result.incidents
    });

  } catch (error) {
    console.error("Get incidents error:", error);

    return res.status(500).json({
      message: "Failed to fetch incidents"
    });
  }
}


// ============================================================
// GET INCIDENT BY ID
// GET /api/incidents/:id
// ============================================================

export async function getIncidentByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const incidentId = req.params.id;

    if (typeof incidentId !== "string") {
      return res.status(400).json({
        message: "Incident ID is required"
      });
    }

    const incident = await getIncidentById(
      incidentId
    );

    return res.status(200).json({
      incident
    });

  } catch (error) {
    console.error("Get incident error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch incident";

    if (message === "Incident not found") {
      return res.status(404).json({
        message
      });
    }

    return res.status(500).json({
      message: "Failed to fetch incident"
    });
  }
}


// ============================================================
// UPDATE INCIDENT STATUS
// PATCH /api/incidents/:id/status
// ============================================================

export async function updateIncidentStatusController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const incidentId = req.params.id;

    if (typeof incidentId !== "string") {
      return res.status(400).json({
        message: "Incident ID is required"
      });
    }

    const input =
      validateUpdateIncidentStatusInput(
        req.body
      );

    const incident =
      await updateIncidentStatus(
        incidentId,
        input.status,
        req.user.userId
      );

    return res.status(200).json({
      message: "Incident status updated successfully",
      incident
    });

  } catch (error) {
    console.error(
      "Update incident status error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update incident status";

    if (
      message === "Incident not found"
    ) {
      return res.status(404).json({
        message
      });
    }

    if (
      message.startsWith(
        "Invalid status transition"
      ) ||
      message.startsWith(
        "Invalid incident status"
      ) ||
      message.startsWith(
        "Invalid current incident status"
      ) ||
      message.startsWith(
        "Incident is already"
      )
    ) {
      return res.status(400).json({
        message
      });
    }

    return res.status(400).json({
      message
    });
  }
}


// ============================================================
// ASSIGN INCIDENT
// PATCH /api/incidents/:id/assign
// ============================================================

export async function assignIncidentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const incidentId = req.params.id;

    if (typeof incidentId !== "string") {
      return res.status(400).json({
        message: "Incident ID is required"
      });
    }

    const input =
      validateAssignIncidentInput(
        req.body
      );

    const incident =
      await assignIncident(
        incidentId,
        input.assignedTo,
        req.user.userId
      );

    return res.status(200).json({
      message: "Incident assigned successfully",
      incident
    });

  } catch (error) {
    console.error(
      "Assign incident error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to assign incident";

    if (
      message === "Incident not found" ||
      message === "Assigned user not found"
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
// ADD INCIDENT EVENT
// POST /api/incidents/:id/events
// ============================================================

export async function createIncidentEventController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const incidentId = req.params.id;

    if (typeof incidentId !== "string") {
      return res.status(400).json({
        message: "Incident ID is required"
      });
    }

    const input =
      validateCreateIncidentEventInput(
        req.body
      );

    const event =
      await createIncidentEvent(
        incidentId,
        input.eventType,
        input.message,
        req.user.userId
      );

    return res.status(201).json({
      message: "Incident event created successfully",
      event
    });

  } catch (error) {
    console.error(
      "Create incident event error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create incident event";

    if (message === "Incident not found") {
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
// INCIDENT SUMMARY
// GET /api/incidents/summary
// ============================================================

export async function getIncidentSummaryController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const summary = await getIncidentSummary();

    return res.status(200).json({
      summary
    });

  } catch (error) {
    console.error("Get incident summary error:", error);

    return res.status(500).json({
      message: "Failed to fetch incident summary"
    });
  }
}