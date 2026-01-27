import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SecurityAlerts() {
  const [alerts] = useState([
    { id: 1, message: "Mouvement de foule détecté à la Fan Zone A — évitez la zone.", level: "rouge" },
    { id: 2, message: "Incident mineur signalé à la piscine olympique — secours sur place.", level: "orange" },
    { id: 3, message: "Contrôle sécurité renforcé aux portes d'accès nord — retard possible.", level: "vert" },
    { id: 4, message: "Panne électrique localisée au stand C — équipes techniques intervenues.", level: "info" },
    { id: 5, message: "Alerte météo : fortes rafales attendues en fin d'après-midi.", level: "orange" },
  ]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Alertes de sécurité</h2>
      <ul className="space-y-2">
        {alerts.map((a) => {
          const bg = a.level === "rouge" ? "bg-red-100" : a.level === "orange" ? "bg-yellow-100" : a.level === "vert" ? "bg-green-100" : "bg-gray-100";
          return (
            <li key={a.id} className={`p-3 rounded ${bg}`}>
              {a.message}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
