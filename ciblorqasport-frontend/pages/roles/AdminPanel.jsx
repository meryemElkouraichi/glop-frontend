import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiClient";

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { apiFetch("/analytics").then((r) => setAnalytics(r.data)); }, []);
  return (
    <div className="p-6">
      <h3>Administration & Analytics</h3>
      {analytics ? (
        <div>
          <p>Utilisateurs actifs : {analytics.dailyActive.join(", ")}</p>
          <p>Durée moyenne : {analytics.avgSession} min</p>
        </div>
      ) : <p>Chargement...</p>}
    </div>
  );
}
