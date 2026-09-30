import type { Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service.js";

export async function getDashboardSummaryController(
  _req: Request,
  res: Response
) {
  try {
    const summary = await getDashboardSummary();

    res.json({
      message: "Dashboard summary fetched successfully",
      summary
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch dashboard summary"
    });
  }
}