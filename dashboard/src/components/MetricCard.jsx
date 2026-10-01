function MetricCard({ metric }) {
    return (
      <div className="metric-card">
        <h3>{metric.service_name}</h3>
  
        <p>{metric.metric_name}</p>
  
        <h2>{metric.metric_value}</h2>
  
        <small>
          {new Date(metric.timestamp).toLocaleString()}
        </small>
      </div>
    );
  }
  
  export default MetricCard;