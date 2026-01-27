import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

export default function CommissaireRequests({ onlyPending = true }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/athlete-requests/all", {
        credentials: "include",
      });

      const data = res.data || [];

      setRequests(
        onlyPending
          ? data.filter(
              (r) =>
                r.status === "en_attente" ||
                r.status === "en attente" ||
                r.status === "pending"
            )
          : data
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [onlyPending]);

  const accept = async (id) => {
    if (!user?.id) return alert("Utilisateur non authentifié");

    try {
      await apiFetch(
        `/athlete-requests/${id}/accept?commissaireId=${user.id}`,
        { method: "POST", credentials: "include" }
      );
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'acceptation");
    }
  };

  const refuse = async (id) => {
    if (!user?.id) return alert("Utilisateur non authentifié");

    const motif = prompt("Motif du refus (optionnel):") || "";

    try {
      await apiFetch(
        `/athlete-requests/${id}/refuse?commissaireId=${user.id}&motif=${encodeURIComponent(
          motif
        )}`,
        { method: "POST", credentials: "include" }
      );
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert("Erreur lors du refus");
    }
  };

  const downloadCertificat = async (id) => {
  const res = await apiFetch(`/athlete-requests/${id}/certificat`, {
    method: "GET",
    responseType: 'blob',
    credentials: "include",
  });
  
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificat-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Demandes Athlètes</h2>

      {loading && <p>Chargement...</p>}
      {!loading && requests.length === 0 && <p>Aucune demande.</p>}

      <ul className="space-y-4 mt-4">
        {requests.map((r) => (
          <li key={r.id} className="border p-4 rounded">
            <div className="flex justify-between">
              <div>
                <p><strong>Utilisateur :</strong> {r.userEmail}</p>
                <p><strong>Sport :</strong> {r.sport?.nom}</p>
                <p><strong>Nation :</strong> {r.nation}</p>
                <p><strong>Genre :</strong> {r.genre}</p>
                <p><strong>Handicap :</strong> {String(r.handicap)}</p>
                <p><strong>Statut :</strong> {r.status}</p>
                {r.motifRefus && (
                  <p><strong>Motif :</strong> {r.motifRefus}</p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => accept(r.id)}
                >
                  Accepter
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => refuse(r.id)}
                >
                  Refuser
                </button>
                {r.hasCertificat && (
                  <button onClick={() => downloadCertificat(r.id)}>
                    Télécharger certificat
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
