import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import IncidentDetails from "./pages/IncidentDetails";
import Logs from "./pages/Logs";
import Metrics from "./pages/Metrics";
import Incidents from "./components/Incidents";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/incidents" element={<Incidents />} />
      <Route path="/incidents/:id" element={<IncidentDetails />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/metrics" element={<Metrics />} />
    </Routes>
  );
}

export default App;