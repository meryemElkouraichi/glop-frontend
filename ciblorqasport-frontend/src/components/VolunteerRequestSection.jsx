import React, { useEffect, useState } from "react";
import VolunteerRequestForm from "./VolunteerRequestForm";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export default function VolunteerRequestSection() {
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [refusedRequests, setRefusedRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDemande = async () => {
    if (!user?.email) {
      setDemande(null);
      setRefusedRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        `/volontaire-requests/me?email=${encodeURIComponent(user.email)}`
      );
      setDemande(res.data);

      const allRes = await apiFetch(
        `/volontaire-requests/me/all?email=${encodeURIComponent(user.email)}`
      );
      const arr = Array.isArray(allRes.data) ? allRes.data : [];
      setAllRequests(arr);
      setRefusedRequests(arr.filter((r) => r.status === "refusee"));
    } catch (err) {
      console.error("Error fetching requests:", err);
      setDemande(null);
      setRefusedRequests([]);
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
  }, [user]);

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-xl font-semibold mb-2">Mes demandes de volontariat</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : allRequests.length === 0 ? (
        <div className="mt-4">
          <button
            onClick={() => setShowFormModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Faire une demande de volontariat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allRequests.map((req) => (
            <div key={req.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold text-lg">{req.evenement?.nom || "Événement inconnu"}</div>
                <div className="text-sm text-gray-600">
                  Type: {req.evenement?.type || "Non spécifié"}
                </div>
                <div className="text-sm text-gray-500">
                  Demandé le: {new Date(req.dateDemande).toLocaleString()}
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  req.status === 'ACCEPTEE' ? 'text-green-600' :
                  req.status === 'REFUSEE' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  Statut: {req.status === 'ACCEPTEE' ? 'Acceptée' :
                           req.status === 'REFUSEE' ? 'Refusée' :
                           'En attente'}
                </div>
                {req.status === 'REFUSEE' && req.motifRefus && (
                  <div className="text-sm text-red-600 mt-1">
                    Motif du refus: {req.motifRefus}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="mt-4">
            <button
              onClick={() => setShowFormModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md transition-all"
            >
              Faire une nouvelle demande
            </button>
          </div>
        </div>
      )}

      {/* Modal for the request form */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFormModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Nouvelle demande de volontariat</h4>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Fermer
              </button>
            </div>
            <VolunteerRequestForm
              onSuccess={() => {
                fetchDemande();
                setShowFormModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
