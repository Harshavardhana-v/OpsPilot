import { pool } from "../../database/database.js";

import type {
  CreateDeploymentInput
} from "./deployment.validation.js";


// ============================================================
// CREATE DEPLOYMENT
// ============================================================

export async function createDeployment(
  input: CreateDeploymentInput
) {

  // ----------------------------------------------------------
  // Check service exists
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
  // Check deployed user exists if provided
  // ----------------------------------------------------------

  if (input.deployedBy) {
    const userResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [input.deployedBy]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Deployed user not found");
    }
  }


  // ----------------------------------------------------------
  // Insert deployment
  // ----------------------------------------------------------

  const result = await pool.query(
    `
    INSERT INTO deployments (
      service_id,
      version,
      commit_hash,
      deployed_by,
      environment,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      service_id,
      version,
      commit_hash,
      deployed_by,
      environment,
      status,
      deployed_at
    `,
    [
      input.serviceId,
      input.version,
      input.commitHash ?? null,
      input.deployedBy ?? null,
      input.environment ?? "production",
      input.status ?? "success"
    ]
  );

  return result.rows[0];
}


// ============================================================
// GET DEPLOYMENTS
// ============================================================

export interface DeploymentFilters {
  serviceId?: string;
  status?: string;
  environment?: string;
}


export async function getDeployments(
  filters: DeploymentFilters = {}
) {

  const conditions: string[] = [];
  const values: string[] = [];


  if (filters.serviceId) {
    values.push(filters.serviceId);

    conditions.push(
      `d.service_id = $${values.length}`
    );
  }


  if (filters.status) {
    values.push(filters.status);

    conditions.push(
      `d.status = $${values.length}`
    );
  }


  if (filters.environment) {
    values.push(filters.environment);

    conditions.push(
      `d.environment = $${values.length}`
    );
  }


  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


  const result = await pool.query(
    `
    SELECT
      d.id,
      d.service_id,
      s.name AS service_name,
      d.version,
      d.commit_hash,
      d.deployed_by,
      u.name AS deployed_by_name,
      d.environment,
      d.status,
      d.deployed_at
    FROM deployments d
    JOIN services s
      ON s.id = d.service_id
    LEFT JOIN users u
      ON u.id = d.deployed_by
    ${whereClause}
    ORDER BY d.deployed_at DESC
    LIMIT 100
    `,
    values
  );

  return result.rows;
}


// ============================================================
// GET DEPLOYMENT BY ID
// ============================================================

export async function getDeploymentById(
  id: string
) {

  const result = await pool.query(
    `
    SELECT
      d.id,
      d.service_id,
      s.name AS service_name,
      d.version,
      d.commit_hash,
      d.deployed_by,
      u.name AS deployed_by_name,
      d.environment,
      d.status,
      d.deployed_at
    FROM deployments d
    JOIN services s
      ON s.id = d.service_id
    LEFT JOIN users u
      ON u.id = d.deployed_by
    WHERE d.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Deployment not found");
  }

  return result.rows[0];
}