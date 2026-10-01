import { useEffect, useState } from "react"; 
import api from "../services/api"; 
 
function Metrics() { 
  const [metrics, setMetrics] = useState([]); 
  const [loading, setLoading] = useState(true); 
 
  const fetchMetrics = async () => { 
    try { 
      const response = await api.get("/metrics"); 
      setMetrics(response.data.metrics); 
    } catch (error) { 
      console.error("Failed to fetch metrics:", error); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  useEffect(() => { 
    fetchMetrics(); 
 
    const interval = setInterval(fetchMetrics, 5000); 
 
    return () => clearInterval(interval); 
  }, []); 
 
  if (loading) { 
    return <p>Loading metrics...</p>; 
  } 
 
  return ( 
    <div className="metrics-page"> 
      <h1>Metrics</h1> 
      <p>Production metrics collected by OpsPilot</p> 
 
      <div className="metrics-list"> 
        {metrics.map((metric) => ( 
          <div className="metric-row" key={metric.id}> 
            <div> 
              <strong>{metric.service_name}</strong> 
            </div> 
 
            <div> 
              {metric.metric_name} 
            </div> 
 
            <div> 
              <strong>{metric.metric_value}%</strong> 
            </div> 
 
            <div> 
              {new Date(metric.timestamp).toLocaleString()} 
            </div> 
          </div> 
        ))} 
      </div> 
    </div> 
  ); 
} 
 
export default Metrics;