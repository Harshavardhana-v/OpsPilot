import { pool } from "../../database/database.js";

import type {
  CreateLogInput
} from "./log.validation.js";


// ============================================================
// CREATE LOG
// ============================================================

export async function createLog(
  input: CreateLogInput
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
  // Insert log
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    INSERT INTO logs (
      service_id,
      level,
      message,
      metadata,
      timestamp
    )
    VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
    RETURNING
      id,
      service_id,
      level,
      message,
      metadata,
      timestamp
    `,
    [
      input.serviceId ?? null,
      input.level,
      input.message,
      input.metadata
        ? JSON.stringify(input.metadata)
        : null,
      input.timestamp ?? null
    ]
  );

  return result.rows[0];
}


// ============================================================
// GET LOGS
// ============================================================

export async function getLogs(
  serviceId?: string,
  level?: string
) {

  const values: string[] = [];
  const conditions: string[] = [];

  if (serviceId) {
    values.push(serviceId);

    conditions.push(
      `service_id = $${values.length}`
    );
  }

  if (level) {
    values.push(level);

    conditions.push(
      `level = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


  const result = await pool.query(
    `
    SELECT
      id,
      service_id,
      level,
      message,
      metadata,
      timestamp
    FROM logs
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT 100
    `,
    values
  );

  return result.rows;
}


// ============================================================
// GET LOG BY ID
// ============================================================

export async function getLogById(
  id: string
) {

  const result = await pool.query(
    `
    SELECT
      id,
      service_id,
      level,
      message,
      metadata,
      timestamp
    FROM logs
    WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Log not found");
  }

  return result.rows[0];
}