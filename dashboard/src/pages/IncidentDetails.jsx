import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/IncidentDetails.css";

function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchIncident = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/incidents/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch incident");
      }

      const data = await response.json();
      setIncident(data.incident);
    } catch (err) {
      console.error(err);
      setError("Unable to load incident");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/incidents/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // Refresh incident after status update
      await fetchIncident();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="incident-details-page">
        <button className="back-btn" onClick={() => navigate("/incidents")}>
          ← Back to Incidents
        </button>

        <div className="details-card loading-card">
          Loading incident...
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="incident-details-page">
        <button className="back-btn" onClick={() => navigate("/incidents")}>
          ← Back to Incidents
        </button>

        <div className="details-card error-card">
          {error || "Incident not found"}
        </div>
      </div>
    );
  }

  const currentStatus = incident.status?.toLowerCase();

  const nextStatus = {
    open: "investigating",
    investigating: "identified",
    identified: "monitoring",
    monitoring: "resolved",
  };

  const next = nextStatus[currentStatus];

  return (
    <div className="incident-details-page">

      <button className="back-btn" onClick={() => navigate("/incidents")}>
        ← Back to Incidents
      </button>

      {/* HEADER */}
      <div className="incident-details-header">

        <div>
          <p className="page-label">INCIDENT DETAILS</p>

          <h1>{incident.title}</h1>

          <p className="incident-id">
            ID: {incident.id}
          </p>
        </div>

        <div className="incident-badges">

          <span
            className={`severity-badge ${incident.severity?.toLowerCase()}`}
          >
            {incident.severity}
          </span>

          <span
            className={`status-badge ${currentStatus}`}
          >
            {currentStatus}
          </span>

        </div>

      </div>

      {/* STATUS WORKFLOW */}
      <div className="details-card workflow-card">

        <h2>Incident Workflow</h2>

        <div className="workflow">

          {["open", "investigating", "identified", "monitoring", "resolved"].map(
            (status, index) => (
              <React.Fragment key={status}>

                <div
                  className={`workflow-step ${
                    currentStatus === status ? "active" : ""
                  } ${
                    ["open", "investigating", "identified", "monitoring", "resolved"]
                      .indexOf(currentStatus) > index
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="workflow-dot">
                    {["open", "investigating", "identified", "monitoring", "resolved"]
                      .indexOf(currentStatus) > index
                      ? "✓"
                      : index + 1}
                  </div>

                  <span>{status}</span>
                </div>

                {index < 4 && (
                  <div
                    className={`workflow-line ${
                      ["open", "investigating", "identified", "monitoring", "resolved"]
                        .indexOf(currentStatus) > index
                        ? "completed"
                        : ""
                    }`}
                  />
                )}

              </React.Fragment>
            )
          )}

        </div>

        {error && (
          <div className="status-error">
            {error}
          </div>
        )}

        {currentStatus !== "resolved" ? (
          <div className="status-action">

            <p>
              Current status:
              <strong> {currentStatus}</strong>
            </p>

            <button
              className="next-status-btn"
              disabled={updating}
              onClick={() => updateStatus(next)}
            >
              {updating
                ? "Updating..."
                : `Move to ${next}`}
            </button>

          </div>
        ) : (
          <div className="resolved-message">
            ✓ Incident Resolved
            <span>
              This incident has been successfully resolved.
            </span>
          </div>
        )}

      </div>

      {/* DESCRIPTION */}
      <div className="details-card">

        <h2>Description</h2>

        <p>
          {incident.description || "No description available."}
        </p>

      </div>

      {/* INCIDENT INFORMATION */}
      <div className="details-card">

        <h2>Incident Information</h2>

        <div className="info-grid">

          <div className="info-item">
            <span>Service</span>
            <strong>
              {incident.service_name || "Unknown"}
            </strong>
          </div>

          <div className="info-item">
            <span>Severity</span>
            <strong>
              {incident.severity}
            </strong>
          </div>

          <div className="info-item">
            <span>Status</span>
            <strong>
              {incident.status}
            </strong>
          </div>

          <div className="info-item">
            <span>Created By</span>
            <strong>
              {incident.created_by_name || "Harsha"}
            </strong>
          </div>

          <div className="info-item">
            <span>Assigned To</span>
            <strong>
              {incident.assigned_to_name || "Unassigned"}
            </strong>
          </div>

          <div className="info-item">
            <span>Started At</span>
            <strong>
              {incident.started_at
                ? new Date(incident.started_at).toLocaleString()
                : "N/A"}
            </strong>
          </div>

          <div className="info-item">
            <span>Created At</span>
            <strong>
              {incident.created_at
                ? new Date(incident.created_at).toLocaleString()
                : "N/A"}
            </strong>
          </div>

          <div className="info-item">
            <span>Resolved At</span>
            <strong>
              {incident.resolved_at
                ? new Date(incident.resolved_at).toLocaleString()
                : "Not resolved"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default IncidentDetails;