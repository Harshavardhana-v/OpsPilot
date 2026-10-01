import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        OpsPilot
      </div>

      <nav className="sidebar-nav">
  <Link to="/">Dashboard</Link>

  <Link to="/incidents">Incidents</Link>

  <Link to="/logs">Logs</Link>

  <Link to="/metrics">Metrics</Link>
</nav>
    </aside>
  );
}

export default Sidebar;