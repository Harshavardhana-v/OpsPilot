import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "admin" | "engineer" | "viewer";
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header is required"
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      !decoded.userId ||
      !decoded.role
    ) {
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    req.user = {
      userId: String(decoded.userId),
      role: decoded.role as "admin" | "engineer" | "viewer"
    };

    next();

  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}


export function authorize(
    ...allowedRoles: Array<"admin" | "engineer" | "viewer">
  ) {
    return (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "You do not have permission to perform this action"
        });
      }
  
      next();
    };
  }