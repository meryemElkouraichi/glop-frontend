import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import AthleteDetailModal from "../../components/AthleteDetailModal";

export default function CommissaireRequests({ onlyPending = true }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [userCountry, setUserCountry] = useState(null);

  // Fetch user's country
  useEffect(() => {
    if (user?.id) {
      const fetchUserCountry = async () => {
        try {
          const res = await apiFetch(`/users/${user.id}`, {
            credentials: "include",
          });
          setUserCountry(res.data.paysId);
        } catch (e) {
          console.error("Erreur lors du chargement du pays:", e);
        }
      };
      fetchUserCountry();
    }
  }, [user?.id]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // If user has NO country assigned, don't fetch requests
      if (!userCountry) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Fetch only requests for that country
      const res = await apiFetch(`/athlete-requests/by-country/${userCountry}`, {
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
          : data.filter(r => !(r.status === "acceptee" || r.status === "acceptée"))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [onlyPending, userCountry]);

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
      
      {!userCountry && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded mb-4">
          <p>Aucun pays n'est assigné à votre compte. Veuillez configurer votre pays dans votre profil pour voir les demandes.</p>
        </div>
      )}

      {loading && <p>Chargement...</p>}
      
      {!loading && requests.length === 0 && (
        <p>{onlyPending ? "Aucune demande en attente." : "Aucune demande."}</p>
      )}

      {/* Demandes en attente */}
      {!onlyPending && requests.some(r => r.status === "en_attente" || r.status === "en attente" || r.status === "pending") && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">Demandes en attente</h3>
          <ul className="space-y-4">
            {requests
              .filter(r => r.status === "en_attente" || r.status === "en attente" || r.status === "pending")
              .map((r) => (
                <li key={r.id} className="border p-4 rounded">
                  {renderRequest(r)}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Demandes refusées */}
      {!onlyPending && requests.some(r => r.status === "refusee" || r.status === "refusée") && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Demandes refusées</h3>
          <ul className="space-y-4">
            {requests
              .filter(r => r.status === "refusee" || r.status === "refusée")
              .map((r) => (
                <li key={r.id} className="border border-red-300 bg-red-50 p-4 rounded">
                  {renderRequest(r)}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Affichage normal quand onlyPending = true */}
      {onlyPending && (
        <ul className="space-y-4 mt-4">
          {requests.map((r) => (
            <li key={r.id} className="border p-4 rounded">
              {renderRequest(r)}
            </li>
          ))}
        </ul>
      )}

      {selectedAthleteId && (
        <AthleteDetailModal
          athleteId={selectedAthleteId}
          onClose={() => setSelectedAthleteId(null)}
        />
      )}
    </div>
  );

  function renderRequest(r) {
    return (
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
            className="bg-blue-600 text-white px-3 py-1 rounded w-full"
            onClick={() => setSelectedAthleteId(r.userId)}
          >
            Détails
          </button>

          {(r.status === "en_attente" || r.status === "en attente" || r.status === "pending") && (
            <>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded w-full"
                onClick={() => accept(r.id)}
              >
                Accepter
              </button>

              <button
                className="bg-red-600 text-white px-3 py-1 rounded w-full"
                onClick={() => refuse(r.id)}
              >
                Refuser
              </button>
            </>
          )}
          
          {r.hasCertificat && (
            <button 
              onClick={() => downloadCertificat(r.id)}
              className="bg-gray-600 text-white px-3 py-1 rounded w-full"
            >
              Télécharger certificat
            </button>
          )}
        </div>
      </div>
    );
  }
}
