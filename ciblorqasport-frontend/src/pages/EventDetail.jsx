import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    apiFetch(`/events/${id}`).then((r) => setEvent(r.data || { title: "Épreuve inconnue" }));
  }, [id]);

  if (!event) return <div className="p-6">Chargement...</div>;

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
            <p>{event.status}</p>
          </div>
        </div>
      </div>

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

      {event.typeObjet === "EPREUVE" && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-xl font-semibold mb-3">Résultats et Classement</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Pour voir ou saisir les performances des athlètes sur cette épreuve.
          </p>
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
