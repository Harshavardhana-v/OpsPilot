import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../database/database.js";
import { env } from "../../config/env.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";



export async function registerUser(input: RegisterInput) {
  const { name, email, password, role } = input;

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `
    INSERT INTO users
      (name, email, password_hash, role)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
    `,
    [name, email, passwordHash, role]
  );

  return result.rows[0];
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const result = await pool.query(
    `
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}