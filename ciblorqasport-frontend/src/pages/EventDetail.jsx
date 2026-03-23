import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  // State pour l'événement et les résultats
  const [event, setEvent] = useState(null);
  const [resultats, setResultats] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // State pour la gestion des participants
  const [eligibleAthletes, setEligibleAthletes] = useState([]);
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [partLoading, setPartLoading] = useState(false);
  const [partError, setPartError] = useState("");
  const [partSuccess, setPartSuccess] = useState("");
  const [expandedTeams, setExpandedTeams] = useState({}); // Tracking which teams are expanded

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (event && event.typeObjet === "EPREUVE") {
      fetchParticipants();
      fetchEligibleAthletes();
    }
  }, [event]);

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

  const fetchParticipants = async () => {
    try {
      const res = await apiFetch(`/epreuves/${id}/participants`);
      setCurrentParticipants(res.data || []);
    } catch (err) {
      console.error("Error loading participants:", err);
    }
  };

  const fetchEligibleAthletes = async () => {
    try {
      const res = await apiFetch(`/epreuves/${id}/participants/eligible`);
      setEligibleAthletes(res.data || []);
    } catch (err) {
      console.error("Error loading eligible athletes:", err);
    }
  };

  const submitAddParticipant = async () => {
    if (!selectedAthleteId) return;
    setPartLoading(true);
    setPartError("");
    setPartSuccess("");

    try {
      const isTeam = eligibleAthletes.some(a => a.id === selectedAthleteId && a.type === "EQUIPE");
      const payload = isTeam ? { equipeId: selectedAthleteId } : { athleteId: selectedAthleteId };

      await apiFetch(`/epreuves/${id}/participants`, {
        method: "POST",
        data: payload
      });

      setPartSuccess(isTeam ? "Équipe ajoutée !" : "Athlète ajouté !");
      setSelectedAthleteId("");
      fetchParticipants();
    } catch (err) {
      console.error(err);
      setPartError(err.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setPartLoading(false);
    }
  };

  const handleRemoveParticipant = async (params) => {
    if (!window.confirm("Retirer ce participant de l'épreuve ?")) return;
    setPartLoading(true);
    setPartError("");
    try {
      const searchParams = new URLSearchParams(params).toString();
      await apiFetch(`/epreuves/${id}/participants?${searchParams}`, {
        method: "DELETE"
      });
      setPartSuccess("Participant retiré !");
      fetchParticipants();
    } catch (err) {
      console.error("Erreur lors du retrait:", err);
      setPartError(err.response?.data?.message || err.message || "Erreur lors du retrait.");
    } finally {
      setPartLoading(false);
    }
  };

  const handleRemoveAthleteFromTeam = async (teamId, athleteId) => {
    if (!window.confirm("Retirer cet athlète de l'équipe ?")) return;
    setPartLoading(true);
    setPartError("");
    try {
      // On utilise l'API de gestion des équipes (à vérifier si elle existe)
      // Sinon on peut passer par un endpoint spécifique
      await apiFetch(`/equipes/${teamId}/membres/${athleteId}`, {
        method: "DELETE"
      });
      setPartSuccess("Athlète retiré de l'équipe !");
      fetchParticipants(); // Refresh pour voir la liste à jour
    } catch (err) {
      console.error(err);
      setPartError("Erreur lors du retrait de l'athlète.");
    } finally {
      setPartLoading(false);
    }
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
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

  if (!event) return <div className="p-12 text-center text-gray-500">Chargement des détails...</div>;

  const isCommissaire = user?.roles?.some(r => r === ROLES.COMMISSAIRE);
  const isCommissaireOrAdmin = user?.roles?.some(r => r === ROLES.COMMISSAIRE || r === ROLES.ADMIN);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
              {event.typeObjet}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{event.nom}</h2>
          </div>
          {event.discipline && (
            <p className="text-slate-500 font-medium ml-1">
              {event.discipline} <span className="mx-2 opacity-30">|</span> {event.genre}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${event.status === 'TERMINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
            }`}>
            {event.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Lieu / Pays</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <p className="font-bold text-slate-800">{event.lieu?.nom || event.lieuSpecifique || event.paysOrganisateur}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Calendrier</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <p className="font-bold text-slate-800">{event.dateDebut}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Horaires</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕒</span>
                  <p className="font-bold text-slate-800">{event.heureDebut} - {event.heureFin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants - COMMISSAIRE ONLY */}
          {event.typeObjet === "EPREUVE" && isCommissaire && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  👥 Gestion des Participants
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-black uppercase">
                  {currentParticipants.length} Inscrits
                </span>
              </div>

              <div className="p-8 space-y-8">
                {/* Search/Add Section */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ajouter un athlète à l'épreuve</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-slate-500/20 outline-none transition-all shadow-sm"
                      value={selectedAthleteId}
                      onChange={(e) => setSelectedAthleteId(e.target.value)}
                      disabled={partLoading || eligibleAthletes.length === 0}
                    >
                      <option value="">-- Sélectionner un athlète --</option>
                      {eligibleAthletes.map(a => (
                        <option key={a.id} value={a.id}>{a.prenom || a.nom} {a.prenom ? a.nom : ""} ({a.nation})</option>
                      ))}
                    </select>
                    <button
                      onClick={submitAddParticipant}
                      disabled={!selectedAthleteId || partLoading}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center min-w-[120px]"
                    >
                      {partLoading ? <span className="animate-spin mr-2">⏳</span> : "Ajouter"}
                    </button>
                  </div>
                  {partError && <p className="text-red-500 text-xs mt-3 font-bold bg-red-50 p-2 rounded-lg inline-block">❌ {partError}</p>}
                  {partSuccess && <p className="text-emerald-600 text-xs mt-3 font-bold bg-emerald-50 p-2 rounded-lg inline-block">✅ {partSuccess}</p>}
                </div>

                {/* Participants Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {currentParticipants.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-slate-400 italic text-sm">Aucun participant n'est encore inscrit pour cette épreuve.</p>
                    </div>
                  ) : (() => {
                    const hasTeams = currentParticipants.some(p => p.type === 'EQUIPE');
                    const displayList = hasTeams
                      ? currentParticipants.filter(p => p.type === 'EQUIPE')
                      : currentParticipants;

                    return displayList.map(p => (
                      <div key={p.id + p.type} className="flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-blue-300 transition-all">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{p.type === 'EQUIPE' ? p.nom : `${p.prenom} ${p.nom}`}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.nation}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {p.type === 'EQUIPE' && (
                              <button
                                onClick={() => toggleTeam(p.id)}
                                className="text-[10px] font-black text-slate-400 hover:text-slate-900 px-2 py-1 uppercase tracking-tighter"
                              >
                                {expandedTeams[p.id] ? "Masquer membres ▲" : "Voir membres ▼"}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveParticipant(p.type === 'EQUIPE' ? { equipeId: p.id } : { athleteId: p.id })}
                              className="px-3 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all uppercase tracking-widest"
                              title="Retirer le participant"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>

                        {/* Expandable Members List */}
                        {p.type === 'EQUIPE' && expandedTeams[p.id] && p.membres && (
                          <div className="bg-slate-50/50 border-t border-slate-50 p-4 space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Composition de l'équipe</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {p.membres.map(m => (
                                <div key={m.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                      {m.prenom[0]}{m.nom[0]}
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{m.prenom} {m.nom}</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveAthleteFromTeam(p.id, m.id)}
                                    className="text-[9px] font-bold text-slate-300 hover:text-red-600 transition-colors uppercase"
                                    title="Retirer de l'équipe"
                                  >
                                    Sortir
                                  </button>
                                </div>
                              ))}
                            </div>
                            {p.membres.length === 0 && <p className="text-xs text-slate-400 italic px-2">Aucun membre enregistré.</p>}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Results Table (if finished) */}
          {event.status === "TERMINE" && resultats.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-lg font-bold text-slate-800">🏁 Résultats Officiels</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rang</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlète / Natation</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {resultats.map((res, idx) => (
                      <tr key={res.id} className={`${idx < 3 ? 'bg-slate-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shadow-sm ${res.rang === 1 ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-400/20' :
                            res.rang === 2 ? 'bg-slate-300 text-slate-700 ring-4 ring-slate-300/20' :
                              res.rang === 3 ? 'bg-amber-600 text-white ring-4 ring-amber-600/20' :
                                'bg-slate-100 text-slate-500'
                            }`}>
                            {res.rang}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-800">{res.athlete?.user?.prenom} {res.athlete?.user?.nom}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{res.athlete?.nation}</p>
                        </td>
                        <td className="px-8 py-5 text-right font-mono font-black text-slate-900">
                          {res.tempsSecondes != null ? formatSecondsToTime(res.tempsSecondes) :
                            res.score != null ? `${res.score} BUTS` :
                              res.points != null ? `${res.points} PTS` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Children View */}
          {event.typeObjet === "COMPETITION" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                📂 Épreuves au programme
              </h3>
              {event.enfants && event.enfants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.enfants.map(child => (
                    <Link key={child.id} to={`/events/${child.id}`} className="group p-5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-slate-200/50 transition-all flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded-md mb-2 inline-block shadow-sm">
                          {child.typeObjet}
                        </span>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{child.nom}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">{child.dateDebut} • {child.heureDebut}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm text-center py-8">Aucun événement n'est encore programmé pour cette compétition.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Actions Card */}
          {event.typeObjet === "EPREUVE" && isCommissaireOrAdmin && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Actions de contrôle</p>
              <div className="space-y-3">
                <Link
                  to={`/events/${id}/resultats`}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                >
                  <span className="text-xl">🏆</span>
                  Gérer les résultats
                </Link>
                {/* Plus d'actions peuvent être ajoutées ici */}
              </div>
            </div>
          )}

          {/* Special Detail - Ceremonie */}
          {event.typeObjet === "CEREMONIE" && event.typeCeremonie && (
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-3xl shadow-xl shadow-amber-500/20 text-white">
              <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-4">Type de Célébration</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">
                  ✨
                </div>
                <p className="text-2xl font-black italic tracking-tight">{event.typeCeremonie}</p>
              </div>
            </div>
          )}

          {/* Navigation Helper */}
          <div className="p-4">
            <Link to="/events" className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 font-bold text-sm transition-all">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                ←
              </div>
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
