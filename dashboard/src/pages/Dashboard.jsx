import { useEffect, useState } from "react";
import Incidents from "../components/Incidents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/metrics");

      const data = response.data.metrics || [];

      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading OpsPilot...</p>
      </div>
    );
  }

  // ============================================================
  // CPU VALUES
  // ============================================================

  const latestValue =
    metrics.length > 0 ? Number(metrics[0].metric_value) : 0;

  const averageValue =
    metrics.length > 0
      ? (
          metrics.reduce(
            (sum, metric) => sum + Number(metric.metric_value),
            0
          ) / metrics.length
        ).toFixed(1)
      : 0;

  const maximumValue =
    metrics.length > 0
      ? Math.max(
          ...metrics.map((metric) => Number(metric.metric_value))
        )
      : 0;

  // ============================================================
  // SYSTEM STATUS
  // ============================================================

  let cpuStatus = "NORMAL";
  let cpuMessage = "System is operating normally.";
  let statusIcon = "✓";

  if (latestValue >= 90) {
    cpuStatus = "CRITICAL";
    cpuMessage = "CPU usage is critically high.";
    statusIcon = "!";
  } else if (latestValue >= 80) {
    cpuStatus = "HIGH";
    cpuMessage = "CPU usage is higher than normal.";
    statusIcon = "!";
  }

  // ============================================================
  // CHART DATA
  // ============================================================

  const chartData = [...metrics]
    .reverse()
    .map((metric) => ({
      time: new Date(metric.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      cpu: Number(metric.metric_value),
    }));

  // ============================================================
  // HELPER FOR METRIC STATUS
  // ============================================================

  const getMetricStatus = (value) => {
    if (value >= 90) return "Critical";
    if (value >= 80) return "High";
    return "Normal";
  };

  return (
    <div className="dashboard">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="dashboard-header">
        <div>
          <h1>OpsPilot</h1>
          <p>Production Incident & Reliability Platform</p>
        </div>

        <div className="live-indicator">
          <span className="live-dot"></span>
          LIVE
        </div>
      </header>


      {/* ======================================================
          SYSTEM STATUS
      ======================================================= */}

      <section className={`system-status ${cpuStatus.toLowerCase()}`}>

        <div className="status-left">
          <div className="status-icon">
            {statusIcon}
          </div>

          <div>
            <p className="status-label">SYSTEM STATUS</p>

            <h2>
              {cpuStatus === "CRITICAL"
                ? "Critical"
                : cpuStatus === "HIGH"
                ? "High CPU Usage"
                : "System Healthy"}
            </h2>

            <p className="status-message">
              {cpuMessage}
            </p>
          </div>
        </div>

        <div className="status-cpu">
          <span>Current CPU</span>
          <strong>{latestValue}%</strong>
        </div>

      </section>


      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <section className="summary-grid">

        <div className="summary-card">
          <div className="card-header">
            <span>Latest CPU</span>
            <span className="card-icon">⚡</span>
          </div>

          <h2>{latestValue}%</h2>

          <p>Current CPU utilization</p>
        </div>


        <div className="summary-card">
          <div className="card-header">
            <span>Average CPU</span>
            <span className="card-icon">📊</span>
          </div>

          <h2>{averageValue}%</h2>

          <p>Average recorded utilization</p>
        </div>


        <div className="summary-card">
          <div className="card-header">
            <span>Maximum CPU</span>
            <span className="card-icon">🔥</span>
          </div>

          <h2>{maximumValue}%</h2>

          <p>Highest recorded utilization</p>
        </div>

      </section>


      {/* ======================================================
          CPU CHART
      ======================================================= */}

      <section className="panel chart-panel">

        <div className="panel-header">
          <div>
            <h2>CPU Usage</h2>
            <p>Real-time CPU utilization history</p>
          </div>

          <div className="chart-legend">
            <span className="legend-line"></span>
            CPU Usage
          </div>
        </div>

        <div className="chart-wrapper">

          <ResponsiveContainer width="100%" height={420}>

            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30343d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b93a7"
                tick={{ fill: "#8b93a7", fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#8b93a7"
                tick={{ fill: "#8b93a7" }}
                label={{
                  value: "CPU %",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#8b93a7",
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1e26",
                  border: "1px solid #343946",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />

              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU"
                stroke="#3b9cff"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: "#3b9cff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>


      {/* ======================================================
          RECENT METRICS
      ======================================================= */}

      <section className="panel metrics-panel">

        <div className="panel-header">

          <div>
            <h2>Recent Metrics</h2>
            <p>Latest telemetry received from services</p>
          </div>

          <div className="refresh-info">
            Auto refresh: 5s
          </div>

        </div>


        <div className="table-container">

          <table className="metrics-table">

            <thead>
              <tr>
                <th>Service</th>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>

              {metrics.slice(0, 20).map((metric) => {

                const value = Number(metric.metric_value);
                const status = getMetricStatus(value);

                return (
                  <tr key={metric.id}>

                    <td>
                      <div className="service-name">
                        <span className="service-dot"></span>
                        {metric.service_name}
                      </div>
                    </td>

                    <td>
                      <span className="metric-name">
                        {metric.metric_name}
                      </span>
                    </td>

                    <td>
                      <strong className="metric-value">
                        {value}%
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="timestamp">
                      {new Date(
                        metric.timestamp
                      ).toLocaleString()}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="dashboard-footer">

        <span>
          OpsPilot Monitoring System
        </span>

        <span>
          Last updated:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "--"}
        </span>

      </footer>
      <Incidents />
    </div>
  );
}

export default Dashboard;