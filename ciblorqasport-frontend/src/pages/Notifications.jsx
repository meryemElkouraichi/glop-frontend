import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch("/notifications").then((r) => setNotifications(r.data || [
      { id: 1, text: "Résultat : Léon remporte la médaille d'or !" },
      { id: 2, text: "Nouvelle épreuve ajoutée : Relais 4x100m" },
    ]));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="p-2 border rounded bg-white">{n.text}</li>
        ))}
      </ul>
    </div>
  );
}
