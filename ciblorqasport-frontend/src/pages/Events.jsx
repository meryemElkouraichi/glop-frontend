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
    filterType === "all" ? true : (e.typeObjet?.toLowerCase() || "") === filterType
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Programme des événements</h2>

      <div className="mb-4 space-x-2 text-sm">
        <button onClick={() => setFilterType("all")} className={`px-3 py-1 rounded ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Tous</button>
        <button onClick={() => setFilterType("competition")} className={`px-3 py-1 rounded ${filterType === 'competition' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Compétitions</button>
        <button onClick={() => setFilterType("ceremonie")} className={`px-3 py-1 rounded ${filterType === 'ceremonie' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Cérémonies</button>
      </div>

      <ul className="space-y-3">
        {filtered.map((e) => (
          <li key={e.id} className="p-3 border rounded bg-white hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{e.nom}</div>
                <div className="text-gray-600">{e.lieuSpecifique || e.paysOrganisateur}</div>
                <div className="text-sm text-gray-500">
                  {e.dateDebut} {e.dateFin && e.dateFin !== e.dateDebut ? ` - ${e.dateFin}` : ""} • {e.heureDebut?.substring(0, 5)}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{e.typeObjet}</div>
              </div>
              <Link to={`/events/${e.id}`} className="text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">
                Voir détails
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
