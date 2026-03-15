import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const res = await apiFetch(`/events/${id}`);
      const eventData = res.data || { title: "Épreuve inconnue" };
      setEvent(eventData);

      if (eventData.status === "TERMINE") {
        loadResults();
      }
    } catch (err) {
      console.error("Error loading event:", err);
    }
  };

  const loadResults = async () => {
    setLoadingResults(true);
    try {
      const res = await apiFetch(`/epreuves/${id}/resultats`);
      setResultats(res.data || []);
    } catch (err) {
      console.error("Error loading results:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const formatSecondsToTime = (seconds) => {
    if (seconds == null) return "";
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(2);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(5, '0')}`;
  };

  if (!event) return <div className="p-6">Chargement...</div>;

  const isCommissaireOrAdmin = user?.roles?.some(r => r === ROLES.COMMISSAIRE || r === ROLES.ADMINISTRATEUR);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{event.nom}</h2>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase font-semibold">{event.typeObjet}</span>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-semibold">Lieu / Pays</p>
            <p>{event.lieuSpecifique || event.paysOrganisateur || "Non défini"}</p>
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Date</p>
            <p>{event.dateDebut} {event.dateFin && event.dateFin !== event.dateDebut ? ` - ${event.dateFin}` : ""}</p>
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Horaires</p>
            <p>{event.heureDebut} - {event.heureFin}</p>
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Statut</p>
            <p className={`font-bold ${event.status === 'TERMINE' ? 'text-green-600' : 'text-blue-600'}`}>
              {event.status}
            </p>
          </div>
        </div>
      </div>

      {event.status === "TERMINE" && resultats.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Classement Final</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Athlète</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Perfs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resultats.map((res, idx) => (
                <tr key={res.id} className={idx < 3 ? "bg-amber-50/50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm
                      ${res.rang === 1 ? "bg-yellow-400 text-yellow-900" :
                        res.rang === 2 ? "bg-gray-300 text-gray-800" :
                          res.rang === 3 ? "bg-amber-600 text-amber-50" :
                            "bg-gray-100 text-gray-600"}`}>
                      {res.rang}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{res.athlete?.user?.prenom} {res.athlete?.user?.nom}</div>
                    <div className="text-xs text-gray-500">{res.athlete?.nation}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    {res.tempsSecondes != null && formatSecondsToTime(res.tempsSecondes)}
                    {res.score != null && `${res.score} buts`}
                    {res.points != null && `${res.points} pts`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {event.typeObjet === "COMPETITION" && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Épreuves et Cérémonies incluses</h3>
          {event.enfants && event.enfants.length > 0 ? (
            <ul className="space-y-2">
              {event.enfants.map(child => (
                <li key={child.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{child.nom}</span>
                    <span className="text-xs text-gray-500 ml-2">({child.typeObjet})</span>
                    <div className="text-xs text-gray-600">
                      {child.dateDebut} • {child.heureDebut}
                    </div>
                  </div>
                  <Link to={`/events/${child.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Aucune épreuve ou cérémonie associée pour le moment.</p>
          )}
        </div>
      )}

      {event.typeObjet === "EPREUVE" && isCommissaireOrAdmin && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-xl font-semibold mb-3">Gestion des Résultats</h3>
          <p className="text-gray-600 mb-4 text-sm">Saisir ou modifier les performances des athlètes.</p>
          <Link
            to={`/events/${id}/resultats`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Consulter / Gérer les résultats
          </Link>
        </div>
      )}

      {event.typeObjet === "CEREMONIE" && event.typeCeremonie && (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-6">
          <h3 className="font-semibold text-yellow-800">Détails Cérémonie</h3>
          <p>Type : {event.typeCeremonie}</p>
        </div>
      )}

      <div className="mt-6">
        <Link to="/events" className="text-blue-600 hover:underline">← Retour à la liste</Link>
      </div>
    </div>
  );
}
