import { pool } from "../../database/database.js";

import type {
  CreateServiceInput,
  UpdateServiceInput
} from "./service.validation.js";


// ============================================================
// CREATE SERVICE
// ============================================================

export async function createService(
  input: CreateServiceInput
) {
  if (input.ownerId) {
    const ownerResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [input.ownerId]
    );

    if (ownerResult.rows.length === 0) {
      throw new Error("Owner not found");
    }
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO services (
        name,
        description,
        owner_id,
        environment,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        description,
        owner_id,
        environment,
        status,
        created_at,
        updated_at
      `,
      [
        input.name,
        input.description ?? null,
        input.ownerId ?? null,
        input.environment ?? "production",
        input.status ?? "healthy"
      ]
    );

    return result.rows[0];

  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "services_name_key"
      )
    ) {
      throw new Error(
        "Service with this name already exists"
      );
    }

    throw error;
  }
}


// ============================================================
// GET SERVICES
// ============================================================

export interface ServiceFilters {
  environment?: string;
  status?: string;
  ownerId?: string;
}


export async function getServices(
  filters: ServiceFilters = {}
) {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.environment) {
    values.push(filters.environment);

    conditions.push(
      `s.environment = $${values.length}`
    );
  }

  if (filters.status) {
    values.push(filters.status);

    conditions.push(
      `s.status = $${values.length}`
    );
  }

  if (filters.ownerId) {
    values.push(filters.ownerId);

    conditions.push(
      `s.owner_id = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.owner_id,
      u.name AS owner_name,
      s.environment,
      s.status,
      s.created_at,
      s.updated_at
    FROM services s
    LEFT JOIN users u
      ON u.id = s.owner_id
    ${whereClause}
    ORDER BY s.created_at DESC
    `,
    values
  );

  return result.rows;
}


// ============================================================
// GET SERVICE BY ID
// ============================================================

export async function getServiceById(
  id: string
) {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.owner_id,
      u.name AS owner_name,
      s.environment,
      s.status,
      s.created_at,
      s.updated_at
    FROM services s
    LEFT JOIN users u
      ON u.id = s.owner_id
    WHERE s.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Service not found");
  }

  return result.rows[0];
}


// ============================================================
// UPDATE SERVICE
// ============================================================

export async function updateService(
  id: string,
  input: UpdateServiceInput
) {
  if (input.ownerId) {
    const ownerResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [input.ownerId]
    );

    if (ownerResult.rows.length === 0) {
      throw new Error("Owner not found");
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    fields.push(`name = $${values.length}`);
  }

  if (input.description !== undefined) {
    values.push(input.description);
    fields.push(
      `description = $${values.length}`
    );
  }

  if (input.ownerId !== undefined) {
    values.push(input.ownerId);
    fields.push(
      `owner_id = $${values.length}`
    );
  }

  if (input.environment !== undefined) {
    values.push(input.environment);
    fields.push(
      `environment = $${values.length}`
    );
  }

  if (input.status !== undefined) {
    values.push(input.status);
    fields.push(
      `status = $${values.length}`
    );
  }

  values.push(id);

  const result = await pool.query(
    `
    UPDATE services
    SET
      ${fields.join(", ")},
      updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING
      id,
      name,
      description,
      owner_id,
      environment,
      status,
      created_at,
      updated_at
    `,
    values
  );

  if (result.rows.length === 0) {
    throw new Error("Service not found");
  }

  return result.rows[0];
}


// ============================================================
// DELETE SERVICE
// ============================================================

export async function deleteService(
  id: string
) {
  const result = await pool.query(
    `
    DELETE FROM services
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Service not found");
  }

  return result.rows[0];
}