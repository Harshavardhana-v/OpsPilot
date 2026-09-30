import { pool } from "../../database/database.js";

import {
  createIncident
} from "../incidents/incident.service.js";

export interface AlertRule {
  id: string;
  service_id: string;
  name: string;
  metric_name: string;
  condition: string;
  threshold: number;
  severity: string;
  enabled: boolean;
}

// ============================================================
// EVALUATE CONDITION
// ============================================================

function evaluateCondition(
  value: number,
  condition: string,
  threshold: number
): boolean {
  switch (condition) {
    case ">":
      return value > threshold;

    case ">=":
      return value >= threshold;

    case "<":
      return value < threshold;

    case "<=":
      return value <= threshold;

    case "=":
    case "==":
      return value === threshold;

    default:
      throw new Error(
        `Unsupported alert condition: ${condition}`
      );
  }
}

// ============================================================
// EVALUATE METRIC
// ============================================================

export async function evaluateMetric(
  serviceId: string,
  metricName: string,
  metricValue: number
) {
  // ----------------------------------------------------------
  // Find enabled alert rules
  // ----------------------------------------------------------

  const result = await pool.query<AlertRule>(
    `
    SELECT
      id,
      service_id,
      name,
      metric_name,
      condition,
      threshold,
      severity,
      enabled
    FROM alert_rules
    WHERE service_id = $1
      AND metric_name = $2
      AND enabled = true
    `,
    [serviceId, metricName]
  );

  const triggeredRules: AlertRule[] = [];

  // ----------------------------------------------------------
  // Evaluate each rule
  // ----------------------------------------------------------

  for (const rule of result.rows) {

    const triggered = evaluateCondition(
      metricValue,
      rule.condition,
      rule.threshold
    );

    // --------------------------------------------------------
    // Check existing open alert
    // --------------------------------------------------------

    const existingAlert = await pool.query(
      `
      SELECT id
      FROM alerts
      WHERE service_id = $1
        AND alert_rule_id = $2
        AND status = 'open'
      LIMIT 1
      `,
      [
        serviceId,
        rule.id
      ]
    );

    // ========================================================
    // CONDITION IS TRIGGERED
    // ========================================================

    if (triggered) {

      // ------------------------------------------------------
      // Alert already exists
      // ------------------------------------------------------

      if (existingAlert.rows.length > 0) {
        triggeredRules.push(rule);
        continue;
      }

      // ------------------------------------------------------
      // Create alert
      // ------------------------------------------------------

      const message =
        `${rule.name}: ${metricName} value ${metricValue} ` +
        `violated condition ${rule.condition} ${rule.threshold}`;

      const alertResult = await pool.query(
        `
        INSERT INTO alerts (
          service_id,
          alert_rule_id,
          metric_name,
          metric_value,
          severity,
          status,
          message
        )
        VALUES ($1, $2, $3, $4, $5, 'open', $6)
        RETURNING id
        `,
        [
          serviceId,
          rule.id,
          metricName,
          metricValue,
          rule.severity,
          message
        ]
      );

      const alertId = alertResult.rows[0].id;

      // ======================================================
      // CREATE INCIDENT FOR SEV1 / SEV2
      // ======================================================

      if (
        rule.severity === "SEV1" ||
        rule.severity === "SEV2"
      ) {

        const incident = await createIncident(
          {
            serviceId,
            title: rule.name,
            description: message,
            severity: rule.severity
          },
          "7d7d906b-02f0-445e-a1fe-41d1050d5449"
        );

        // ----------------------------------------------------
        // Link alert to incident
        // ----------------------------------------------------

        await pool.query(
          `
          UPDATE alerts
          SET incident_id = $1
          WHERE id = $2
          `,
          [
            incident.id,
            alertId
          ]
        );
      }

      triggeredRules.push(rule);

      continue;
    }

    // ========================================================
// CONDITION IS NOT TRIGGERED
// ========================================================

if (existingAlert.rows.length > 0) {

    // ------------------------------------------------------
    // Resolve the alert
    // ------------------------------------------------------
  
    const alertId = existingAlert.rows[0].id;
  
    const resolvedAlert = await pool.query(
      `
      UPDATE alerts
      SET
        status = 'resolved',
        resolved_at = NOW()
      WHERE id = $1
        AND status = 'open'
      RETURNING
        id,
        incident_id
      `,
      [alertId]
    );
  
    // ------------------------------------------------------
    // Resolve linked incident
    // ------------------------------------------------------
  
    if (
      resolvedAlert.rows.length > 0 &&
      resolvedAlert.rows[0].incident_id
    ) {
  
      await pool.query(
        `
        UPDATE incidents
        SET
          status = 'resolved',
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
          AND status = 'open'
        `,
        [resolvedAlert.rows[0].incident_id]
      );
    }
  }
  }

  return triggeredRules;
}