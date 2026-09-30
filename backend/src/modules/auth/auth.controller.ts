import type { Request, Response } from "express";

import {
  registerSchema,
  loginSchema
} from "./auth.validation.js";

import {
  registerUser,
  loginUser
} from "./auth.service.js";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const input = registerSchema.parse(req.body);

    const user = await registerUser(input);

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error: any) {

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors
      });
    }

    if (error.message === "User already exists") {
      return res.status(409).json({
        message: error.message
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.json(result);

  } catch (error: any) {

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors
      });
    }

    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        message: error.message
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
}