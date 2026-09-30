import { pool } from "../../database/database.js";

import {
  type CreateIncidentInput,
  validateStatusTransition
} from "./incident.validation.js";


// ============================================================
// CREATE INCIDENT
// ============================================================

export async function createIncident(
  input: CreateIncidentInput,
  createdBy: string
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check service
    const serviceResult = await client.query(
      `SELECT id, name
       FROM services
       WHERE id = $1`,
      [input.serviceId]
    );

    if (serviceResult.rowCount === 0) {
      throw new Error("Service not found");
    }

    // Check assigned user if provided
    if (input.assignedTo) {
      const userResult = await client.query(
        `SELECT id
         FROM users
         WHERE id = $1`,
        [input.assignedTo]
      );

      if (userResult.rowCount === 0) {
        throw new Error("Assigned user not found");
      }
    }

    // Create incident
    const incidentResult = await client.query(
      `INSERT INTO incidents
        (
          service_id,
          title,
          description,
          severity,
          status,
          created_by,
          assigned_to
        )
       VALUES ($1, $2, $3, $4, 'open', $5, $6)
       RETURNING *`,
      [
        input.serviceId,
        input.title,
        input.description ?? null,
        input.severity ?? "SEV3",
        createdBy,
        input.assignedTo ?? null
      ]
    );

    const incident = incidentResult.rows[0];

    // Create initial timeline event
    await client.query(
      `INSERT INTO incident_events
        (
          incident_id,
          event_type,
          message,
          metadata
        )
       VALUES ($1, 'created', $2, $3)`,
      [
        incident.id,
        `Incident "${incident.title}" was created`,
        JSON.stringify({
          severity: incident.severity,
          createdBy
        })
      ]
    );

    await client.query("COMMIT");

    return incident;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}


// ============================================================
// INCIDENT FILTERS
// ============================================================

export interface IncidentFilters {
  status?: string | undefined;
  severity?: string | undefined;
  serviceId?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

// ============================================================
// GET ALL INCIDENTS
// ============================================================

export async function getIncidents(
  filters: IncidentFilters = {}
) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`i.status = $${values.length}`);
  }

  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`i.severity = $${values.length}`);
  }

  if (filters.serviceId) {
    values.push(filters.serviceId);
    conditions.push(`i.service_id = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(
    Math.max(filters.limit ?? 10, 1),
    100
  );

  const offset = (page - 1) * limit;

  // ----------------------------------------------------------
  // Get total count
  // ----------------------------------------------------------

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM incidents i
    ${whereClause}
    `,
    values
  );

  const total = countResult.rows[0].total;

  // ----------------------------------------------------------
  // Get paginated incidents
  // ----------------------------------------------------------

  const dataValues = [...values];

  dataValues.push(limit);
  const limitParam = dataValues.length;

  dataValues.push(offset);
  const offsetParam = dataValues.length;

  const result = await pool.query(
    `
    SELECT
      i.id,
      i.service_id,
      s.name AS service_name,
      i.title,
      i.description,
      i.severity,
      i.status,
      i.started_at,
      i.resolved_at,
      i.created_by,
      creator.name AS created_by_name,
      i.assigned_to,
      assignee.name AS assigned_to_name,
      i.created_at,
      i.updated_at
    FROM incidents i
    JOIN services s
      ON s.id = i.service_id
    LEFT JOIN users creator
      ON creator.id = i.created_by
    LEFT JOIN users assignee
      ON assignee.id = i.assigned_to
    ${whereClause}
    ORDER BY i.created_at DESC
    LIMIT $${limitParam}
    OFFSET $${offsetParam}
    `,
    dataValues
  );

  return {
    incidents: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// ============================================================
// GET INCIDENT BY ID
// ============================================================

export async function getIncidentById(id: string) {
  const result = await pool.query(
    `
    SELECT
      i.id,
      i.service_id,
      s.name AS service_name,
      i.title,
      i.description,
      i.severity,
      i.status,
      i.started_at,
      i.resolved_at,
      i.created_by,
      creator.name AS created_by_name,
      i.assigned_to,
      assignee.name AS assigned_to_name,
      i.created_at,
      i.updated_at
    FROM incidents i
    JOIN services s
      ON s.id = i.service_id
    LEFT JOIN users creator
      ON creator.id = i.created_by
    LEFT JOIN users assignee
      ON assignee.id = i.assigned_to
    WHERE i.id = $1
    `,
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("Incident not found");
  }

  const incident = result.rows[0];

  const eventsResult = await pool.query(
    `
    SELECT
      id,
      event_type,
      message,
      metadata,
      created_at
    FROM incident_events
    WHERE incident_id = $1
    ORDER BY created_at ASC
    `,
    [id]
  );

  return {
    ...incident,
    events: eventsResult.rows
  };
}


// ============================================================
// UPDATE INCIDENT STATUS
// ============================================================

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: string,
  userId: string
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ----------------------------------------------------------
    // 1. Get current incident
    // ----------------------------------------------------------

    const incidentResult = await client.query(
      `
      SELECT id, status, title
      FROM incidents
      WHERE id = $1
      FOR UPDATE
      `,
      [incidentId]
    );

    if (incidentResult.rows.length === 0) {
      throw new Error("Incident not found");
    }

    const incident = incidentResult.rows[0];

    const currentStatus = incident.status;

    // ----------------------------------------------------------
    // 2. Validate status transition
    // ----------------------------------------------------------

    validateStatusTransition(
      currentStatus,
      newStatus
    );

    // ----------------------------------------------------------
    // 3. Update incident
    // ----------------------------------------------------------

    const resolvedAt =
      newStatus === "resolved"
        ? new Date()
        : null;

    const updateResult = await client.query(
      `
      UPDATE incidents
      SET
        status = $1,
        resolved_at = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [
        newStatus,
        resolvedAt,
        incidentId
      ]
    );

    // ----------------------------------------------------------
    // 4. Create incident event
    // ----------------------------------------------------------

    await client.query(
      `
      INSERT INTO incident_events (
        incident_id,
        event_type,
        message,
        metadata
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        incidentId,
        "status_changed",
        `Incident status changed from ${currentStatus} to ${newStatus}`,
        JSON.stringify({
          oldStatus: currentStatus,
          newStatus,
          changedBy: userId
        })
      ]
    );

    // ----------------------------------------------------------
    // 5. Commit transaction
    // ----------------------------------------------------------

    await client.query("COMMIT");

    return updateResult.rows[0];

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }
}

// ============================================================
// ASSIGN INCIDENT
// PATCH /api/incidents/:id/assign
// ============================================================

export async function assignIncident(
  incidentId: string,
  assignedTo: string,
  userId: string
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ----------------------------------------------------------
    // 1. Check incident exists
    // ----------------------------------------------------------

    const incidentResult = await client.query(
      `
      SELECT id, title, assigned_to
      FROM incidents
      WHERE id = $1
      FOR UPDATE
      `,
      [incidentId]
    );

    if (incidentResult.rows.length === 0) {
      throw new Error("Incident not found");
    }

    const incident = incidentResult.rows[0];

    // ----------------------------------------------------------
    // 2. Check assigned user exists
    // ----------------------------------------------------------

    const userResult = await client.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      `,
      [assignedTo]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Assigned user not found");
    }

    const assignedUser = userResult.rows[0];

    // ----------------------------------------------------------
    // 3. Update incident
    // ----------------------------------------------------------

    const updateResult = await client.query(
      `
      UPDATE incidents
      SET
        assigned_to = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [assignedTo, incidentId]
    );

    // ----------------------------------------------------------
    // 4. Create timeline event
    // ----------------------------------------------------------

    await client.query(
      `
      INSERT INTO incident_events (
        incident_id,
        event_type,
        message,
        metadata
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        incidentId,
        "assigned",
        `Incident assigned to ${assignedUser.name}`,
        JSON.stringify({
          assignedTo,
          assignedToName: assignedUser.name,
          assignedToEmail: assignedUser.email,
          assignedToRole: assignedUser.role,
          assignedBy: userId
        })
      ]
    );

    // ----------------------------------------------------------
    // 5. Commit transaction
    // ----------------------------------------------------------

    await client.query("COMMIT");

    return updateResult.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}

// ============================================================
// ADD INCIDENT EVENT
// POST /api/incidents/:id/events
// ============================================================

export async function createIncidentEvent(
  incidentId: string,
  eventType: string,
  message: string,
  userId: string
) {
  // ----------------------------------------------------------
  // 1. Check that incident exists
  // ----------------------------------------------------------

  const incidentResult = await pool.query(
    `
    SELECT id
    FROM incidents
    WHERE id = $1
    `,
    [incidentId]
  );

  if (incidentResult.rowCount === 0) {
    throw new Error("Incident not found");
  }

  // ----------------------------------------------------------
  // 2. Create timeline event
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    INSERT INTO incident_events (
      incident_id,
      event_type,
      message,
      metadata
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      incident_id,
      event_type,
      message,
      metadata,
      created_at
    `,
    [
      incidentId,
      eventType,
      message,
      JSON.stringify({
        createdBy: userId
      })
    ]
  );

  // ----------------------------------------------------------
  // 3. Return created event
  // ----------------------------------------------------------

  return result.rows[0];
}

// ============================================================
// INCIDENT SUMMARY
// GET /api/incidents/summary
// ============================================================

export async function getIncidentSummary() {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS total,

      COUNT(*) FILTER (
        WHERE status = 'open'
      )::int AS open,

      COUNT(*) FILTER (
        WHERE status = 'investigating'
      )::int AS investigating,

      COUNT(*) FILTER (
        WHERE status = 'identified'
      )::int AS identified,

      COUNT(*) FILTER (
        WHERE status = 'monitoring'
      )::int AS monitoring,

      COUNT(*) FILTER (
        WHERE status = 'resolved'
      )::int AS resolved,

      COUNT(*) FILTER (
        WHERE severity = 'SEV1'
      )::int AS sev1,

      COUNT(*) FILTER (
        WHERE severity = 'SEV2'
      )::int AS sev2,

      COUNT(*) FILTER (
        WHERE severity = 'SEV3'
      )::int AS sev3,

      COUNT(*) FILTER (
        WHERE severity = 'SEV4'
      )::int AS sev4

    FROM incidents
  `);

  return result.rows[0];
}