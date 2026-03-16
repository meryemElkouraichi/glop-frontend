import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [dateEvenement, setDateEvenement] = useState("");
  const [evenementId, setEvenementId] = useState("");
  const [fichierBillet, setFichierBillet] = useState(null);
  const [evenements, setEvenements] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch user's tickets
  const fetchTickets = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/tickets/me?email=${encodeURIComponent(user.email)}`, {
        credentials: "include",
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des billets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available epreuves (on utilise /api/epreuves qui retourne directement les épreuves)
  const fetchEvenements = async () => {
    try {
      const res = await apiFetch("/epreuves", {
        credentials: "include",
      });
      setEvenements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des épreuves:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchEvenements();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, PNG, JPG)
      const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Format de fichier non supporté. Utilisez PDF, PNG ou JPG.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 5MB).");
        return;
      }
      setFichierBillet(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dateEvenement || !fichierBillet) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("dateEvenement", dateEvenement);
      if (evenementId) {
        formData.append("evenementId", evenementId);
      }
      formData.append("fichierBillet", fichierBillet);

      const res = await apiFetch("/tickets/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      alert("Billet importé avec succès !");
      setShowForm(false);
      setDateEvenement("");
      setEvenementId("");
      setFichierBillet(null);
      fetchTickets();
    } catch (err) {
      console.error("Erreur lors de l'import du billet:", err);
      const msg = err.response?.data?.message || err.response?.data || "Erreur lors de l'import du billet. Veuillez réessayer.";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  const downloadTicket = async (ticketId, nomFichier) => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}/download`, {
        method: "GET",
        responseType: "blob",
        credentials: "include",
      });

      const fileName = nomFichier || `billet-${ticketId}.pdf`;
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      alert("Erreur lors du téléchargement du billet");
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm("Voulez-vous vraiment supprimer ce billet ?")) return;

    try {
      await apiFetch(`/tickets/${ticketId}`, {
        method: "DELETE",
        credentials: "include",
      });
      alert("Billet supprimé avec succès");
      fetchTickets();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression du billet");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Mes Billets</h2>
          <p className="opacity-80 mt-1">Gérez tous vos accès aux épreuves en un seul endroit.</p>
        </div>
      </div>

      {/* Formulaire d'ajout de billet - Toujours visible */}
      <div className="bg-white border-0 rounded-2xl p-8 mb-10 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-800">Importer un nouveau billet</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Date de l'événement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateEvenement}
              onChange={(e) => setDateEvenement(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Événement lié
            </label>
            <select
              value={evenementId}
              onChange={(e) => setEvenementId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
            >
              <option value="">Sélectionnez un événement</option>
              {evenements.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.nom || evt.title || `Événement ${evt.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Fichier du billet <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="ticket-file-input"
                required
              />
              <label
                htmlFor="ticket-file-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group-hover:bg-blue-50"
              >
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">
                  {fichierBillet ? fichierBillet.name : "Cliquez pour choisir un fichier (PDF, PNG, JPG)"}
                </span>
                {fichierBillet && (
                  <span className="text-xs text-gray-500 mt-1">
                    {(fichierBillet.size / 1024).toFixed(2)} KB
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {uploading ? "Importation..." : "Importer le billet"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des billets */}
      {loading && <p className="text-gray-600">Chargement...</p>}
      {!loading && tickets.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium text-lg">Vous n'avez pas encore de billets enregistrés.</p>
          <p className="text-gray-400 text-sm mt-1">Utilisez le formulaire ci-dessus pour ajouter un nouveau billet.</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="group relative bg-white border-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-black/5">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {t.evenement?.competitionNom
                      ? `${t.evenement.competitionNom} - ${t.evenement.nom}`
                      : (t.evenement?.nom || "Événement Olympique")}
                  </div>
                  <div className="text-xs text-gray-400 font-medium italic truncate max-w-[140px]">
                    {t.nom}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Date de l'épreuve</div>
                      <div className="font-bold text-gray-800">{t.dateEvenement || "Non renseignée"}</div>
                    </div>
                  </div>

                  {t.nom && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div className="truncate pr-4">
                        <div className="text-xs text-gray-400 uppercase font-bold">Fichier attaché</div>
                        <div className="text-sm text-blue-600 font-medium truncate italic">{t.nomFichier}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => downloadTicket(t.id, t.nom)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </button>
                  <button
                    onClick={() => deleteTicket(t.id)}
                    className="w-12 flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 py-2.5 rounded-xl transition"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
