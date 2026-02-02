import React, { useEffect, useState } from "react";
import AthleteRequestForm from "./AthleteRequestForm";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export default function AthleteRequestSection() {
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [refusedRequests, setRefusedRequests] = useState([]);
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
        `/athlete-requests/me?email=${encodeURIComponent(user.email)}`
      );
      setDemande(res.data);

      try {
        const allRes = await apiFetch(
          `/athlete-requests/me/all?email=${encodeURIComponent(user.email)}`
        );
        const arr = Array.isArray(allRes.data) ? allRes.data : [];
        setRefusedRequests(arr.filter((r) => r.status === "refusee"));
      } catch (err) {
        setRefusedRequests([]);
      }
    } catch (err) {
      setDemande(null);
      setRefusedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
  }, [user]);

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-xl font-semibold mb-2">Demande pour devenir Athlète</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : demande?.status && demande.status !== "NONE" ? (
        <div>
          <p>
            Votre demande est actuellement : <strong>{demande.status}</strong>
          </p>

          {demande.status === "refusee" && demande.motifRefus && (
            <p className="text-red-600 mt-2">
              Motif du refus : <strong>{demande.motifRefus}</strong>
            </p>
          )}

          {demande.status !== "en_attente" && (
            <div className="mt-4">
              <p className="mb-2">Vous pouvez soumettre une nouvelle demande :</p>
              <button
                onClick={() => setShowFormModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Nouvelle demande
              </button>
            </div>
          )}

          {refusedRequests.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Historique des refus</h4>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {refusedRequests.map((r) => (
                  <li key={r.id} className="text-sm text-red-700">
                    {r.dateDemande ? new Date(r.dateDemande).toLocaleString() + " - " : ""}
                    <span className="font-medium">{r.sport?.nom || "—"}</span>
                    {r.motifRefus && <span>: {r.motifRefus}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => setShowFormModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Faire une demande
          </button>
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
              <h4 className="text-lg font-semibold">Nouvelle demande athlète</h4>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Fermer
              </button>
            </div>
            <AthleteRequestForm
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
