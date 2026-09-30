import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import {
  validateCreateAlertRuleInput
} from "./alert.validation.js";

import {
    createAlertRule,
    getAlertRules,
    getAlertRuleById,
    updateAlertRuleEnabled,
    getActiveAlerts,
    getAlertById,
    resolveAlert
  } from "./alert.service.js";

// ============================================================
// CREATE ALERT RULE
// POST /api/alerts
// ============================================================

export async function createAlertRuleController(
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
      validateCreateAlertRuleInput(req.body);

    const alertRule =
      await createAlertRule(input);

    return res.status(201).json({
      message: "Alert rule created successfully",
      alertRule
    });

  } catch (error) {
    console.error(
      "Create alert rule error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create alert rule";

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
// GET ALL ALERT RULES
// GET /api/alerts
// ============================================================

export async function getAlertRulesController(
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
      enabled?: boolean;
      severity?: string;
    } = {};

    if (
      typeof req.query.serviceId === "string"
    ) {
      filters.serviceId =
        req.query.serviceId;
    }

    if (
      typeof req.query.enabled === "string"
    ) {
      if (req.query.enabled === "true") {
        filters.enabled = true;
      } else if (
        req.query.enabled === "false"
      ) {
        filters.enabled = false;
      } else {
        return res.status(400).json({
          message:
            "enabled must be true or false"
        });
      }
    }

    if (
      typeof req.query.severity === "string"
    ) {
      filters.severity =
        req.query.severity;
    }

    const alertRules =
      await getAlertRules(filters);

    return res.status(200).json({
      count: alertRules.length,
      alertRules
    });

  } catch (error) {
    console.error(
      "Get alert rules error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch alert rules"
    });
  }
}

// ============================================================
// GET ALERT RULE BY ID
// GET /api/alerts/:id
// ============================================================

export async function getAlertRuleByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const alertRuleId = req.params.id;

    if (typeof alertRuleId !== "string") {
      return res.status(400).json({
        message: "Alert rule ID is required"
      });
    }

    const alertRule =
      await getAlertRuleById(alertRuleId);

    return res.status(200).json({
      alertRule
    });

  } catch (error) {
    console.error(
      "Get alert rule error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch alert rule";

    if (message === "Alert rule not found") {
      return res.status(404).json({
        message
      });
    }

    return res.status(500).json({
      message: "Failed to fetch alert rule"
    });
  }
}

// ============================================================
// ENABLE / DISABLE ALERT RULE
// PATCH /api/alerts/:id/enabled
// ============================================================

export async function updateAlertRuleEnabledController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const alertRuleId = req.params.id;

    if (typeof alertRuleId !== "string") {
      return res.status(400).json({
        message: "Alert rule ID is required"
      });
    }

    if (
      typeof req.body?.enabled !== "boolean"
    ) {
      return res.status(400).json({
        message: "enabled must be a boolean"
      });
    }

    const alertRule =
      await updateAlertRuleEnabled(
        alertRuleId,
        req.body.enabled
      );

    return res.status(200).json({
      message: "Alert rule updated successfully",
      alertRule
    });

  } catch (error) {
    console.error(
      "Update alert rule error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update alert rule";

    if (message === "Alert rule not found") {
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
// GET ACTIVE ALERTS
// GET /api/alerts/active
// ============================================================

export async function getActiveAlertsController(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }
  
      const alerts = await getActiveAlerts();
  
      return res.status(200).json({
        count: alerts.length,
        alerts
      });
  
    } catch (error) {
      console.error("Get active alerts error:", error);
  
      return res.status(500).json({
        message: "Failed to fetch active alerts"
      });
    }
  }
  
  
  // ============================================================
  // GET ALERT BY ID
  // GET /api/alerts/record/:id
  // ============================================================
  
  export async function getAlertByIdController(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }
  
      const alertId = req.params.id;
  
      if (typeof alertId !== "string") {
        return res.status(400).json({
          message: "Alert ID is required"
        });
      }
  
      const alert = await getAlertById(alertId);
  
      return res.status(200).json({
        alert
      });
  
    } catch (error) {
      console.error("Get alert error:", error);
  
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch alert";
  
      if (message === "Alert not found") {
        return res.status(404).json({
          message
        });
      }
  
      return res.status(500).json({
        message: "Failed to fetch alert"
      });
    }
  }
  
  
  // ============================================================
  // RESOLVE ALERT
  // PATCH /api/alerts/record/:id/resolve
  // ============================================================
  
  export async function resolveAlertController(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }
  
      const alertId = req.params.id;
  
      if (typeof alertId !== "string") {
        return res.status(400).json({
          message: "Alert ID is required"
        });
      }
  
      const alert = await resolveAlert(alertId);
  
      return res.status(200).json({
        message: "Alert resolved successfully",
        alert
      });
  
    } catch (error) {
      console.error("Resolve alert error:", error);
  
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resolve alert";
  
      if (
        message === "Alert not found" ||
        message === "Alert is already resolved"
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