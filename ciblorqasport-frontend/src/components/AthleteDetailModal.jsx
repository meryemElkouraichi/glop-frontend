import { useState, useEffect } from "react";
import { apiFetch } from "../api/apiClient";

export default function AthleteDetailModal({ athleteId, onClose }) {
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAthleteDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/athlete-requests/athlete/${athleteId}/details`, {
          credentials: "include",
        });
        setAthlete(res.data);
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement des détails");
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchAthleteDetails();
    }
  }, [athleteId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Détails de l'athlète</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading && <p className="text-center">Chargement...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {athlete && !loading && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-semibold">{athlete.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prénom</p>
              <p className="font-semibold">{athlete.prenom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{athlete.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-semibold">{athlete.telephone || "Non fourni"}</p>
            </div>

            {athlete.refusedRequests && athlete.refusedRequests.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 font-semibold mt-4">
                  Historique des demandes refusées
                </p>
                <div className="space-y-2 mt-2">
                  {athlete.refusedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-red-50 p-3 rounded border border-red-200 text-sm"
                    >
                      <p>
                        <strong>Sport:</strong> {request.sport}
                      </p>
                      <p>
                        <strong>Pays:</strong> {request.pays}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(request.dateRefus).toLocaleDateString("fr-FR")}
                      </p>
                      {request.motif && (
                        <p>
                          <strong>Motif:</strong> {request.motif}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!athlete.refusedRequests || athlete.refusedRequests.length === 0) && (
              <p className="text-gray-500 text-sm italic">Aucune demande refusée</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
