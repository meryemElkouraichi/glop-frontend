import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import { trackAction } from "../../api/useAnalytics";

export default function CommissaireRequests({ onlyPending = true }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [viewMode, setViewMode] = useState(onlyPending ? "pending" : "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackAction(`Commissaire - Onglet Demandes: ${viewMode}`);
  }, [viewMode]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // N'affiche que les demandes pour les disciplines gérées par ce commissaire
      const res = await apiFetch(
        `/athlete-requests/for-commissaire?commissaireId=${user.id}`,
        { credentials: "include" }
      );

      const data = res.data || [];
      setRequests(data.map((d) => ({ ...d })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [onlyPending, user?.id]);

  const accept = async (id) => {
    if (!user?.id) return alert("Utilisateur non authentifié");

    try {
      await apiFetch(
        `/athlete-requests/${id}/accept?commissaireId=${user.id}`,
        { method: "POST", credentials: "include" }
      );
      fetchRequests();
    } catch (e) {
      const msg = e?.response?.data?.message || "Erreur lors de l'acceptation";
      alert(msg);
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
      const msg = e?.response?.data?.message || "Erreur lors du refus";
      alert(msg);
    }
  };

  const downloadCertificat = async (req) => {
    try {
      const res = await apiFetch(`/athlete-requests/${req.id}/certificat`, {
        method: "GET",
        responseType: 'blob',
        credentials: "include",
      });

      const fileName = req.docNom || `certificat-${req.id}.pdf`;
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement", err);
      alert("Erreur lors du téléchargement du certificat");
    }
  };

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsEmail, setDetailsEmail] = useState(null);
  const [detailsPerson, setDetailsPerson] = useState(null);
  const [refusedHistory, setRefusedHistory] = useState([]);
  const [selectedHistoricId, setSelectedHistoricId] = useState(null);

  const showDetails = async (req) => {
    setDetailsEmail(req.userEmail || null);
    setDetailsPerson({
      prenom: req.userPrenom || null,
      nom: req.userNom || null,
      email: req.userEmail || null,
      telephone: req.userTelephone || null,
    });
    setRefusedHistory([]);
    setDetailsOpen(true);
    setDetailsLoading(true);

    try {
      const res = await apiFetch(
        `/athlete-requests/me/all?email=${encodeURIComponent(req.userEmail)}`,
        { credentials: "include" }
      );

      const list = res.data || [];
      const refused = list.filter((d) => {
        if (!d) return false;
        const s = (d.status || "").toString().toLowerCase();
        return s.includes("refus") || (d.motifRefus && d.motifRefus.length > 0);
      });

      // sort by date desc to show latest first
      refused.sort((a, b) => {
        const da = new Date(a.dateDemande || a.date || 0).getTime();
        const db = new Date(b.dateDemande || b.date || 0).getTime();
        return db - da;
      });
      setRefusedHistory(refused);
    } catch (e) {
      console.error("Erreur récupération détails:", e);
      setRefusedHistory([]);
    } finally {
      setDetailsLoading(false);
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Demandes Athlètes</h2>

      <div className="flex items-center gap-3 mt-4">
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === 'all' ? 'bg-gray-200' : 'bg-white'}`}
            onClick={() => setViewMode('all')}
          >Toutes</button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'pending' ? 'bg-gray-200' : 'bg-white'}`}
            onClick={() => setViewMode('pending')}
          >En attente</button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'refused' ? 'bg-pink-200' : 'bg-white'}`}
            onClick={() => setViewMode('refused')}
          >Refusées</button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'accepted' ? 'bg-green-200' : 'bg-white'}`}
            onClick={() => setViewMode('accepted')}
          >Demandes acceptées</button>
        </div>

        <div className="ml-auto">
          <input
            type="search"
            placeholder="Rechercher par nom ou prénom"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-2 py-1 rounded w-64"
          />
        </div>
      </div>

      {loading && <p>Chargement...</p>}
      {!loading && requests.length === 0 && <p>Aucune demande.</p>}

      <ul className="space-y-4 mt-4">
        {(() => {
          // compute displayed list based on viewMode and searchTerm
          const byNameFilter = (item) => {
            if (!searchTerm || searchTerm.trim() === "") return true;
            const q = searchTerm.toLowerCase();
            const prenom = (item.userPrenom || "").toString().toLowerCase();
            const nom = (item.userNom || "").toString().toLowerCase();
            const email = (item.userEmail || "").toString().toLowerCase();
            return prenom.includes(q) || nom.includes(q) || email.includes(q);
          };

          let list = [];

          if (viewMode === 'pending' || onlyPending) {
            list = requests.filter((r) => /en[_ \-]?attente|pending/.test((r.status || "").toString().toLowerCase()));
          } else if (viewMode === 'refused') {
            // group refused by user and keep latest per user
            const refusedBy = {};
            requests.forEach((r) => {
              const s = (r.status || "").toString().toLowerCase();
              const isRefused = /refus/.test(s) || (!!r.motifRefus && !/en[_ \-]?attente|pending/.test(s));
              if (!isRefused) return;
              const key = r.userEmail || r.userId || JSON.stringify([r.userPrenom, r.userNom]);
              const ex = refusedBy[key];
              if (!ex) refusedBy[key] = r;
              else {
                try {
                  if (new Date(r.dateDemande || r.date || 0) > new Date(ex.dateDemande || ex.date || 0)) refusedBy[key] = r;
                } catch (e) { }
              }
            });
            list = Object.values(refusedBy);
          } else if (viewMode === 'accepted') {
            list = requests.filter((r) => /accep/.test((r.status || "").toString().toLowerCase()));
          } else {
            // all: combine non-refused + latest refused per user
            const others = [];
            const refusedBy = {};
            requests.forEach((r) => {
              const s = (r.status || "").toString().toLowerCase();
              const isRefused = /refus/.test(s) || (!!r.motifRefus && !/en[_ \-]?attente|pending/.test(s));
              if (isRefused) {
                const key = r.userEmail || r.userId || JSON.stringify([r.userPrenom, r.userNom]);
                const ex = refusedBy[key];
                if (!ex) refusedBy[key] = r;
                else {
                  try {
                    if (new Date(r.dateDemande || r.date || 0) > new Date(ex.dateDemande || ex.date || 0)) refusedBy[key] = r;
                  } catch (e) { }
                }
              } else others.push(r);
            });
            list = [...others, ...Object.values(refusedBy)];
          }

          // apply name filter and sort by date desc
          list = list.filter(byNameFilter).sort((x, y) => {
            const dx = new Date(x.dateDemande || x.date || 0).getTime();
            const dy = new Date(y.dateDemande || y.date || 0).getTime();
            return dy - dx;
          });

          return list.map((r) => {
            const statusStr = (r.status || "").toString().toLowerCase();
            const isPending = /en[_ \-]?attente|pending/.test(statusStr);
            const isRefused = /refus/.test(statusStr) || (!!r.motifRefus && !isPending);
            const isAccepted = /accep/.test(statusStr);

            return (
              <li key={r.id} className={`border p-4 rounded ${isRefused ? 'bg-pink-50 border-pink-300' : ''} ${isAccepted ? 'bg-green-50 border-green-300' : ''}`}>
                <div className="flex justify-between">
                  <div>
                    <p><strong>Utilisateur :</strong> {((r.userPrenom || r.userNom) ? `${r.userPrenom || ''} ${r.userNom || ''}`.trim() : r.userEmail) || '—'}</p>
                    <p><strong>Discipline :</strong> {r.sport?.discipline}</p>
                    <p><strong>Nation :</strong> {r.nation}</p>
                    <p><strong>Genre :</strong> {r.genre}</p>
                    <p><strong>Handicap :</strong> {String(r.handicap)}</p>
                    <p className="flex items-center gap-3">
                      <strong>Statut :</strong> {r.status}
                      {isRefused && (
                        <span className="inline-block bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs">Refusée</span>
                      )}
                      {isAccepted && (
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Acceptée</span>
                      )}
                    </p>
                    {r.motifRefus && (
                      <p className="text-pink-700"><strong>Motif :</strong> {r.motifRefus}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {isPending && (
                      <>
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
                      </>
                    )}

                    {r.hasCertificat && (
                      <button
                        className=" bg-gray-400  text-white px-3 py-1 rounded"
                        onClick={() => downloadCertificat(r)}>
                        Télécharger certificat
                      </button>
                    )}

                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => showDetails(r)}
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </li>
            );
          });
        })()}
      </ul>

      {detailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails de la demande</h3>
              <button onClick={() => setDetailsOpen(false)} className="text-gray-600">Fermer</button>
            </div>

            <div>
              <p><strong>Nom :</strong> {detailsPerson?.prenom || '—'}</p>
              <p><strong>Prénom :</strong> {detailsPerson?.nom || '—'}</p>
              <p><strong>Email :</strong> {detailsPerson?.email || detailsEmail || '—'}</p>
              <p><strong>Téléphone :</strong> {detailsPerson?.telephone || '—'}</p>

              <div className="mt-4">
                <h4 className="font-medium">Historique des demandes refusées</h4>
                {detailsLoading && <p>Chargement...</p>}
                {!detailsLoading && refusedHistory.length === 0 && (
                  <p>Aucun refus trouvé pour cet utilisateur.</p>
                )}
                {!detailsLoading && refusedHistory.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {refusedHistory.map((d) => (
                      <li key={d.id} className="border p-2 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p><strong>Statut:</strong> {d.status}</p>
                            <p><strong>Date:</strong> {d.dateDemande || d.date || "—"}</p>
                            {d.motifRefus && <p><strong>Motif:</strong> {d.motifRefus}</p>}
                          </div>
                          <div>
                            <button
                              className="ml-4 bg-blue-600 text-white px-3 py-1 rounded"
                              onClick={() => setSelectedHistoricId(selectedHistoricId === d.id ? null : d.id)}
                            >
                              Détails
                            </button>
                          </div>
                        </div>

                        {selectedHistoricId === d.id && (
                          <div className="mt-2 bg-gray-50 p-2 rounded">
                            <p><strong>Sport:</strong> {d.sport?.nom || '—'}</p>
                            <p><strong>Nation:</strong> {d.nation || '—'}</p>
                            <p><strong>Genre:</strong> {d.genre || '—'}</p>
                            <p><strong>Handicap:</strong> {String(d.handicap)}</p>
                            {d.hasCertificat && (
                              <p><a className="text-blue-600 underline" href="#" onClick={(e) => { e.preventDefault(); downloadCertificat(d); }}>Télécharger certificat</a></p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
