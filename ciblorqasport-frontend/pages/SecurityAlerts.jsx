import { useState } from "react";

export default function SecurityAlerts() {
  const [alerts] = useState([
    { id: 1, message: "Alerte : mouvement de foule détecté à la Fan Zone A", level: "rouge" },
    { id: 2, message: "Incident mineur signalé à la piscine olympique", level: "orange" },
  ]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Alertes de sécurité</h2>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.id} className={`p-3 rounded ${a.level === "rouge" ? "bg-red-100" : "bg-yellow-100"}`}>
            {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
