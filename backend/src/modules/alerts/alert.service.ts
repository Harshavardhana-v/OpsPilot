import { pool } from "../../database/database.js";

import type {
  CreateAlertRuleInput
} from "./alert.validation.js";

// ============================================================
// CREATE ALERT RULE
// ============================================================

export async function createAlertRule(
  input: CreateAlertRuleInput
) {
  // ----------------------------------------------------------
  // Verify service exists
  // ----------------------------------------------------------

  const serviceResult = await pool.query(
    `
    SELECT id
    FROM services
    WHERE id = $1
    `,
    [input.serviceId]
  );

  if (serviceResult.rows.length === 0) {
    throw new Error("Service not found");
  }

  // ----------------------------------------------------------
  // Insert alert rule
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    INSERT INTO alert_rules (
      service_id,
      name,
      metric_name,
      condition,
      threshold,
      severity,
      enabled
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      service_id,
      name,
      metric_name,
      condition,
      threshold,
      severity,
      enabled,
      created_at
    `,
    [
      input.serviceId,
      input.name,
      input.metricName,
      input.condition,
      input.threshold,
      input.severity ?? "SEV3",
      input.enabled ?? true
    ]
  );

  return result.rows[0];
}

// ============================================================
// GET ALERT RULES
// ============================================================

export interface AlertRuleFilters {
  serviceId?: string;
  enabled?: boolean;
  severity?: string;
}

export async function getAlertRules(
  filters: AlertRuleFilters = {}
) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.serviceId !== undefined) {
    values.push(filters.serviceId);

    conditions.push(
      `ar.service_id = $${values.length}`
    );
  }

  if (filters.enabled !== undefined) {
    values.push(filters.enabled);

    conditions.push(
      `ar.enabled = $${values.length}`
    );
  }

  if (filters.severity !== undefined) {
    values.push(filters.severity);

    conditions.push(
      `ar.severity = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query(
    `
    SELECT
      ar.id,
      ar.service_id,
      s.name AS service_name,
      ar.name,
      ar.metric_name,
      ar.condition,
      ar.threshold,
      ar.severity,
      ar.enabled,
      ar.created_at
    FROM alert_rules ar
    JOIN services s
      ON s.id = ar.service_id
    ${whereClause}
    ORDER BY ar.created_at DESC
    `,
    values
  );

  return result.rows;
}

// ============================================================
// GET ALERT RULE BY ID
// ============================================================

export async function getAlertRuleById(
  id: string
) {
  const result = await pool.query(
    `
    SELECT
      ar.id,
      ar.service_id,
      s.name AS service_name,
      ar.name,
      ar.metric_name,
      ar.condition,
      ar.threshold,
      ar.severity,
      ar.enabled,
      ar.created_at
    FROM alert_rules ar
    JOIN services s
      ON s.id = ar.service_id
    WHERE ar.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Alert rule not found");
  }

  return result.rows[0];
}

// ============================================================
// ENABLE / DISABLE ALERT RULE
// ============================================================

export async function updateAlertRuleEnabled(
  id: string,
  enabled: boolean
) {
  const result = await pool.query(
    `
    UPDATE alert_rules
    SET enabled = $1
    WHERE id = $2
    RETURNING
      id,
      service_id,
      name,
      metric_name,
      condition,
      threshold,
      severity,
      enabled,
      created_at
    `,
    [enabled, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Alert rule not found");
  }

  return result.rows[0];
}

// ============================================================
// GET ACTIVE ALERTS
// GET /api/alerts/active
// ============================================================

export async function getActiveAlerts() {
    const result = await pool.query(`
      SELECT
        a.id,
        a.service_id,
        s.name AS service_name,
        a.alert_rule_id,
        a.metric_name,
        a.metric_value,
        a.severity,
        a.status,
        a.message,
        a.triggered_at,
        a.resolved_at
      FROM alerts a
      JOIN services s
        ON s.id = a.service_id
      WHERE a.status = 'open'
      ORDER BY a.triggered_at DESC
    `);
  
    return result.rows;
  }
  
  
  // ============================================================
  // GET ALERT BY ID
  // ============================================================
  
  export async function getAlertById(id: string) {
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.service_id,
        s.name AS service_name,
        a.alert_rule_id,
        a.metric_name,
        a.metric_value,
        a.severity,
        a.status,
        a.message,
        a.triggered_at,
        a.resolved_at
      FROM alerts a
      JOIN services s
        ON s.id = a.service_id
      WHERE a.id = $1
      `,
      [id]
    );
  
    if (result.rows.length === 0) {
      throw new Error("Alert not found");
    }
  
    return result.rows[0];
  }
  
  
  // ============================================================
  // RESOLVE ALERT
  // PATCH /api/alerts/:id/resolve
  // ============================================================
  
  export async function resolveAlert(id: string) {
    const result = await pool.query(
      `
      UPDATE alerts
      SET
        status = 'resolved',
        resolved_at = NOW()
      WHERE id = $1
        AND status = 'open'
      RETURNING
        id,
        service_id,
        alert_rule_id,
        metric_name,
        metric_value,
        severity,
        status,
        message,
        triggered_at,
        resolved_at
      `,
      [id]
    );
  
    if (result.rows.length === 0) {
      const existing = await pool.query(
        `
        SELECT id, status
        FROM alerts
        WHERE id = $1
        `,
        [id]
      );
  
      if (existing.rows.length === 0) {
        throw new Error("Alert not found");
      }
  
      if (existing.rows[0].status === "resolved") {
        throw new Error("Alert is already resolved");
      }
  
      throw new Error("Unable to resolve alert");
    }
  
    return result.rows[0];
  }