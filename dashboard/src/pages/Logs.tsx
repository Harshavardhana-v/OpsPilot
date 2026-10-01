
import { useEffect, useState } from "react";
import api from "../services/api";

interface Log {
  id: string;
  service_name: string;
  message: string;
  level: string;
  timestamp: string;
}

function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/logs");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="logs-page">
        <h1>Logs</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="logs-page">
      <h1>Logs</h1>
      <p>Production logs collected by OpsPilot</p>

      {logs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <div className="log-row" key={log.id}>
              <div>
                <strong>{log.service_name}</strong>
              </div>

              <div>{log.message}</div>

              <div>{log.level}</div>

              <div>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Logs;
