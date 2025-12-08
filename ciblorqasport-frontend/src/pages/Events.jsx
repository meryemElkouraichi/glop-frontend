import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    apiFetch("/events").then((r) => setEvents(r.data || []));
  }, []);

  const filtered = events.filter((e) =>
    filterType === "all" ? true : e.type === filterType
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Programme des événements</h2>

      <div className="mb-4 space-x-2 text-sm">
        <button onClick={() => setFilterType("all")}>Tous</button>
        <button onClick={() => setFilterType("competition")}>Compétitions</button>
        <button onClick={() => setFilterType("ceremony")}>Cérémonies</button>
      </div>

      <ul className="space-y-3">
        {filtered.map((e) => (
          <li key={e.id} className="p-3 border rounded bg-white">
            <div className="font-medium">{e.title}</div>
            <div>{e.location?.name}</div>
            <div>{e.date} – {e.time}</div>
            <Link to={`/events/${e.id}`} className="text-blue-600 text-sm">
              Détails de l’épreuve
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
