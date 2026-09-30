import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import {
  validateCreateLogInput
} from "./log.validation.js";

import {
  createLog,
  getLogs,
  getLogById
} from "./log.service.js";


// ============================================================
// CREATE LOG
// POST /api/logs
// ============================================================

export async function createLogController(
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
      validateCreateLogInput(req.body);

    const log =
      await createLog(input);

    return res.status(201).json({
      message: "Log created successfully",
      log
    });

  } catch (error) {

    console.error(
      "Create log error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create log";


    if (message === "Service not found") {
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
// GET LOGS
// GET /api/logs
// ============================================================

export async function getLogsController(
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
      typeof req.query.serviceId === "string"
        ? req.query.serviceId
        : undefined;

    const level =
      typeof req.query.level === "string"
        ? req.query.level
        : undefined;


    const logs =
      await getLogs(
        serviceId,
        level
      );

    return res.status(200).json({
      count: logs.length,
      logs
    });

  } catch (error) {

    console.error(
      "Get logs error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch logs"
    });
  }
}


// ============================================================
// GET LOG BY ID
// GET /api/logs/:id
// ============================================================

export async function getLogByIdController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const logId = req.params.id;

    if (typeof logId !== "string") {
      return res.status(400).json({
        message: "Log ID is required"
      });
    }

    const log =
      await getLogById(logId);

    return res.status(200).json({
      log
    });

  } catch (error) {

    console.error(
      "Get log error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Log not found"
    ) {
      return res.status(404).json({
        message: "Log not found"
      });
    }

    return res.status(500).json({
      message: "Failed to fetch log"
    });
  }
}