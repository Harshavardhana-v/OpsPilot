
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Incidents.css";
import { useNavigate } from "react-router-dom";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const navigate = useNavigate();

  // ============================================================
  // FETCH INCIDENTS
  // ============================================================

  const fetchIncidents = async () => {
    try {
      const response = await api.get("/incidents");

      console.log("INCIDENT API RESPONSE:", response);
      console.log("INCIDENT DATA:", response.data);

      const data = response.data;

      // Backend returns:
      // { incidents: [...] }

      if (Array.isArray(data)) {
        setIncidents(data);
      } else if (Array.isArray(data.incidents)) {
        setIncidents(data.incidents);
      } else {
        console.error("Unexpected API response:", data);
        setIncidents([]);
      }
    } catch (error) {
      console.error("FAILED TO FETCH INCIDENTS:", error);
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);

      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD + AUTO REFRESH
  // ============================================================

  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(fetchIncidents, 5000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // STATUS / SEVERITY CLASSES
  // ============================================================

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "unknown";
  };

  const getSeverityClass = (severity) => {
    return severity?.toLowerCase() || "unknown";
  };

  // ============================================================
  // STATUS WORKFLOW
  // ============================================================

  const getNextStatus = (status) => {
    switch (status) {
      case "open":
        return "investigating";

      case "investigating":
        return "identified";

      case "identified":
        return "monitoring";

      case "monitoring":
        return "resolved";

      default:
        return null;
    }
  };

  const getNextStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Start Investigation";

      case "investigating":
        return "Mark Identified";

      case "identified":
        return "Start Monitoring";

      case "monitoring":
        return "Resolve";

      default:
        return null;
    }
  };

  // ============================================================
  // UPDATE INCIDENT STATUS
  // ============================================================

  const handleStatusUpdate = async (incidentId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdating(incidentId);

      await api.patch(`/incidents/${incidentId}/status`, {
        status: nextStatus,
      });

      await fetchIncidents();
    } catch (error) {
      console.error("FAILED TO UPDATE INCIDENT:", error);
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    } finally {
      setUpdating(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="incidents-section">
        <h2>Incidents</h2>
        <p>Loading incidents...</p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="incidents-section">
      <div className="section-header">
        <div>
          <h2>Incidents</h2>
          <p>Production incidents detected by OpsPilot</p>
        </div>

        <span className="incident-count">
          {incidents.length} incidents
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="no-incidents">
          <div className="no-incidents-icon">✓</div>

          <h3>No incidents</h3>

          <p>The system is operating normally.</p>
        </div>
      ) : (
        <div className="incident-list">
          {incidents.map((incident) => {
            const nextStatus = getNextStatus(incident.status);
            const nextStatusLabel = getNextStatusLabel(incident.status);

            return (
              <div
                className="incident-row"
                key={incident.id}
                onClick={() =>
                  navigate(`/incidents/${incident.id}`)
                }
              >
                {/* ==================================================
                    INCIDENT MAIN INFORMATION
                ================================================== */}

                <div className="incident-main">
                  <div className="incident-title">
                    {incident.title}
                  </div>

                  <div className="incident-description">
                    {incident.description}
                  </div>

                  <div className="incident-meta">
                    <span>
                      Service:{" "}
                      <strong>
                        {incident.service_name || "Unknown"}
                      </strong>
                    </span>

                    <span>
                      Created by:{" "}
                      <strong>
                        {incident.created_by_name || "Unknown"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    INCIDENT STATUS INFORMATION
                ================================================== */}

                <div className="incident-info">
                  {/* SEVERITY */}

                  <span
                    className={`severity-badge ${getSeverityClass(
                      incident.severity
                    )}`}
                  >
                    {incident.severity}
                  </span>

                  {/* STATUS */}

                  <span
                    className={`status-badge ${getStatusClass(
                      incident.status
                    )}`}
                  >
                    {incident.status}
                  </span>

                  {/* CREATED TIME */}

                  <span className="incident-time">
                    {incident.created_at
                      ? new Date(
                          incident.created_at
                        ).toLocaleString()
                      : "Unknown"}
                  </span>

                  {/* ==================================================
                      NEXT STATUS BUTTON
                  ================================================== */}

                  {nextStatus && (
                    <button
                      className={`status-action-btn ${nextStatus}`}
                      onClick={(e) => {
                        e.stopPropagation();

                        handleStatusUpdate(
                          incident.id,
                          incident.status
                        );
                      }}
                      disabled={updating === incident.id}
                    >
                      {updating === incident.id
                        ? "Updating..."
                        : nextStatusLabel}
                    </button>
                  )}

                  {/* ==================================================
                      RESOLVED LABEL
                  ================================================== */}

                  {incident.status === "resolved" && (
                    <span className="resolved-label">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Incidents;