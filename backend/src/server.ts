import "./config/env.js";

import express from "express";
import cors from "cors";

import { pool } from "./database/database.js";

import authRoutes from "./modules/auth/auth.routes.js";
import authTestRoutes from "./modules/auth/auth.test.routes.js";
import incidentRoutes from "./modules/incidents/incident.routes.js";
import logRoutes from "./modules/logs/log.routes.js";
import metricRoutes from "./modules/metrics/metric.routes.js";
import deploymentRoutes from "./modules/deployments/deployment.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";
import alertRoutes from "./modules/alerts/alert.routes.js";

import { startMetricConsumer } from "./kafka/consumer.js";
import { connectProducer } from "./kafka/producer.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/test", authTestRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ============================================================
// BASIC HEALTH CHECK
// ============================================================

app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "opspilot-backend",
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// DATABASE HEALTH CHECK
// ============================================================

app.get("/api/health/db", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    res.json({
      status: "healthy",
      database: "connected",
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error
    );

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(
    `OpsPilot backend running on port ${PORT}`
  );

  // ----------------------------------------------------------
  // Connect Kafka Producer
  // ----------------------------------------------------------

  try {
    await connectProducer();

    console.log(
      "Kafka producer is ready"
    );
  } catch (error) {
    console.error(
      "Failed to connect Kafka producer:",
      error
    );
  }

  // ----------------------------------------------------------
  // Start Kafka Consumer
  // ----------------------------------------------------------

  try {
    await startMetricConsumer();

    console.log(
      "Kafka metric consumer started"
    );
  } catch (error) {
    console.error(
      "Failed to start Kafka consumer:",
      error
    );
  }
});