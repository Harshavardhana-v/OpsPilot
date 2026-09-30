import { pool } from "../../database/database.js";

export async function getDashboardSummary() {
  // Services
  const servicesResult = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'healthy')::int AS healthy,
      COUNT(*) FILTER (WHERE status != 'healthy')::int AS unhealthy
    FROM services
  `);

  // Active alerts
  const alertsResult = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE severity = 'SEV1')::int AS sev1,
      COUNT(*) FILTER (WHERE severity = 'SEV2')::int AS sev2,
      COUNT(*) FILTER (WHERE severity = 'SEV3')::int AS sev3
    FROM alerts
    WHERE status = 'open'
  `);

  // Incidents
  const incidentsResult = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'open')::int AS open,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
    FROM incidents
  `);

  // Recent metrics
  const metricsResult = await pool.query(`
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
    ORDER BY m.timestamp DESC
    LIMIT 20
  `);

  return {
    services: servicesResult.rows[0],
    alerts: alertsResult.rows[0],
    incidents: incidentsResult.rows[0],
    recentMetrics: metricsResult.rows
  };
}