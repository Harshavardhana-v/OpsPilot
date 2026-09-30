import { pool } from "../../database/database.js";

import {
  evaluateMetric
} from "../alerts/alert.evaluator.js";

import type {
  AlertRule
} from "../alerts/alert.evaluator.js";

import type {
  CreateMetricInput
} from "./metric.validation.js";

import {
    publishMetricEvent
  } from "../../kafka/producer.js";
// ============================================================
// CREATE METRIC
// ============================================================

export async function createMetric(
  input: CreateMetricInput
) {
  // ----------------------------------------------------------
  // Verify service exists if serviceId is provided
  // ----------------------------------------------------------

  if (input.serviceId) {
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
  }

  // ----------------------------------------------------------
  // Insert metric
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    INSERT INTO metrics (
      service_id,
      metric_name,
      metric_value,
      timestamp
    )
    VALUES ($1, $2, $3, COALESCE($4, NOW()))
    RETURNING
      id,
      service_id,
      metric_name,
      metric_value,
      timestamp
    `,
    [
      input.serviceId ?? null,
      input.metricName,
      input.metricValue,
      input.timestamp ?? null
    ]
  );

  const metric = result.rows[0];

// ----------------------------------------------------------
// Evaluate alert rules
// ----------------------------------------------------------
let triggeredAlerts: AlertRule[] = [];

if (metric.service_id) {
  triggeredAlerts = await evaluateMetric(
    metric.service_id,
    metric.metric_name,
    metric.metric_value
  );
}

// ----------------------------------------------------------
// Publish metric event to Kafka
// ----------------------------------------------------------
if (metric.service_id) {
  await publishMetricEvent({
    serviceId: metric.service_id,
    metricName: metric.metric_name,
    metricValue: metric.metric_value,
    timestamp: metric.timestamp
  });
}

  // ----------------------------------------------------------
  // Return metric + triggered alerts
  // ----------------------------------------------------------

  return {
    ...metric,
    triggeredAlerts
  };
}


// ============================================================
// GET METRICS
// ============================================================

export interface MetricFilters {
  serviceId?: string;
  metricName?: string;
}

export async function getMetrics(
  filters: MetricFilters = {}
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  // ----------------------------------------------------------
  // Filter by service
  // ----------------------------------------------------------

  if (filters.serviceId) {
    values.push(filters.serviceId);

    conditions.push(
      `m.service_id = $${values.length}`
    );
  }

  // ----------------------------------------------------------
  // Filter by metric name
  // ----------------------------------------------------------

  if (filters.metricName) {
    values.push(filters.metricName);

    conditions.push(
      `m.metric_name = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  // ----------------------------------------------------------
  // Query metrics
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    SELECT
      m.id,
      m.service_id,
      s.name AS service_name,
      m.metric_name,
      m.metric_value,
      m.timestamp
    FROM metrics m
    LEFT JOIN services s
      ON s.id = m.service_id
    ${whereClause}
    ORDER BY m.timestamp DESC
    LIMIT 100
    `,
    values
  );

  return result.rows;
}


// ============================================================
// GET METRIC BY ID
// ============================================================

export async function getMetricById(
  id: string
) {
  const result = await pool.query(
    `
    SELECT
      m.id,
      m.service_id,
      s.name AS service_name,
      m.metric_name,
      m.metric_value,
      m.timestamp
    FROM metrics m
    LEFT JOIN services s
      ON s.id = m.service_id
    WHERE m.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Metric not found");
  }

  return result.rows[0];
}