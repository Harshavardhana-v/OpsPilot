import { Router } from "express";

import {
  authenticate,
  authorize,
  type AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "Authentication successful",
      user: req.user
    });
  }
);

router.get(
  "/admin-only",
  authenticate,
  authorize("admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "You have admin access",
      user: req.user
    });
  }
);

export default router;