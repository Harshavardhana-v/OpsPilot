import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import {
  validateCreateMetricInput
} from "./metric.validation.js";

import {
  createMetric,
  getMetrics,
  getMetricById
} from "./metric.service.js";


// ============================================================
// CREATE METRIC
// POST /api/metrics
// ============================================================

export async function createMetricController(
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
      validateCreateMetricInput(req.body);

    const metric =
      await createMetric(input);

    return res.status(201).json({
      message: "Metric created successfully",
      metric
    });

  } catch (error) {

    console.error(
      "Create metric error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create metric";

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
// GET ALL METRICS
// GET /api/metrics
// ============================================================

export async function getMetricsController(
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

    const metricName =
      typeof req.query.metricName === "string"
        ? req.query.metricName
        : undefined;

    const filters: {
      serviceId?: string;
      metricName?: string;
    } = {};

    if (serviceId !== undefined) {
      filters.serviceId = serviceId;
    }

    if (metricName !== undefined) {
      filters.metricName = metricName;
    }

    const metrics =
      await getMetrics(filters);

    return res.status(200).json({
      count: metrics.length,
      metrics
    });

  } catch (error) {

    console.error(
      "Get metrics error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch metrics"
    });
  }
}


// ============================================================
// GET METRIC BY ID
// GET /api/metrics/:id
// ============================================================

export async function getMetricByIdController(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const metricId = req.params.id;

    if (typeof metricId !== "string") {
      return res.status(400).json({
        message: "Metric ID is required"
      });
    }

    const metric =
      await getMetricById(metricId);

    return res.status(200).json({
      metric
    });

  } catch (error) {

    console.error(
      "Get metric error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch metric";

    if (message === "Metric not found") {
      return res.status(404).json({
        message
      });
    }

    return res.status(500).json({
      message: "Failed to fetch metric"
    });
  }
}