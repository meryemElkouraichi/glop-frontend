import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [subscriptions, setSubscriptions] = useState({});

  const fetchSubscriptions = async (evts) => {
    if (!user) return;
    const statuses = {};
    for (const e of evts) {
      try {
        const res = await apiFetch(`/subscriptions/${e.id}/check`);
        statuses[e.id] = res.data;
      } catch (err) {
        statuses[e.id] = false;
      }
    }
    setSubscriptions(statuses);
  };

  useEffect(() => {
    apiFetch("/events").then((r) => {
      const data = r.data || [];
      setEvents(data);
      fetchSubscriptions(data);
    });
  }, [user]);

  const toggleSubscription = async (eventId) => {
    if (!user) return alert("Veuillez vous connecter pour vous abonner");
    const isSubscribed = subscriptions[eventId];
    try {
      if (isSubscribed) {
        await apiFetch(`/subscriptions/${eventId}`, { method: "DELETE" });
      } else {
        await apiFetch(`/subscriptions/${eventId}`, { method: "POST" });
      }
      setSubscriptions(prev => ({ ...prev, [eventId]: !isSubscribed }));
    } catch (err) {
      alert("Erreur lors de l'abonnement");
    }
  };

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
              <div className="flex flex-col gap-2">
                <Link to={`/events/${e.id}`} className="text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-center">
                  Voir détails
                </Link>
                {(() => {
                  const userRoles = (user?.roles || []).map(r => typeof r === 'string' ? r : r.nom || r.name);
                  const canManage = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.COMMISSAIRE) ||
                    userRoles.includes("Administrateur") || userRoles.includes("Commissaire");
                  const isEpreuve = e.typeObjet?.toUpperCase() === 'EPREUVE' || e.type?.toUpperCase() === 'EPREUVE';

                  if (canManage && isEpreuve) {
                    return (
                      <Link to={`/events/${e.id}/resultats`} className="text-green-600 text-sm border border-green-600 px-3 py-1 rounded hover:bg-green-50 text-center">
                        Résultats
                      </Link>
                    );
                  }
                  return null;
                })()}
                <button
                  onClick={() => toggleSubscription(e.id)}
                  className={`text-sm border px-3 py-1 rounded whitespace-nowrap transition ${subscriptions[e.id]
                    ? 'border-gray-400 text-gray-600 hover:bg-gray-50'
                    : 'border-orange-600 text-orange-600 hover:bg-orange-50'
                    }`}
                >
                  {subscriptions[e.id] ? "🔕 Se désabonner" : "🔔 S'abonner aux notifications"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
