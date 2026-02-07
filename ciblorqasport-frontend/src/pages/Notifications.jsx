import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch("/notifications").then((r) => {
      if (r && Array.isArray(r.data)) {
        setNotifications(r.data);
      }
    });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Mes Notifications</h2>
      {notifications.length === 0 && <p className="text-gray-500">Aucune notification.</p>}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="p-3 border rounded bg-white shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${n.level === 'CRITIQUE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {n.level}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(n.dateEnvoi).toLocaleString()}
              </span>
            </div>
            <p>{n.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
