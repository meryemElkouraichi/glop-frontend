import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // OLD Mock data
    // setAlerts([...]);

    // NEW API Data
    apiFetch("/incidents/active").then((r) => {
      if (r && Array.isArray(r.data)) {
        const mapped = r.data.map(inc => ({
          id: inc.id,
          message: (inc.lieu ? `[${inc.lieu}] ` : "") + inc.description,
          level: mapInfos(inc.level)
        }));
        setAlerts(mapped);
      }
    }).catch(err => console.error("Failed to load alerts", err));
  }, []);

  const mapInfos = (lvl) => {
    if (lvl === 'CRITIQUE') return 'rouge';
    if (lvl === 'IMPORTANT') return 'orange';
    return 'info';
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Alertes de sécurité en cours</h2>
      {alerts.length === 0 && <p className="text-gray-500">Aucune alerte en cours.</p>}
      <ul className="space-y-2">
        {alerts.map((a) => {
          let bg = "bg-gray-100";
          if (a.level === "rouge") bg = "bg-red-100 border-l-4 border-red-500";
          else if (a.level === "orange") bg = "bg-orange-100 border-l-4 border-orange-500";
          else if (a.level === "info") bg = "bg-blue-50 border-l-4 border-blue-500";

          return (
            <li key={a.id} className={`p-3 rounded shadow-sm ${bg}`}>
              <div className="font-medium text-sm text-gray-700 mb-1">
                Niveau : {a.level === 'rouge' ? 'CRITIQUE' : a.level === 'orange' ? 'IMPORTANT' : 'INFO'}
              </div>
              <div>{a.message}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
