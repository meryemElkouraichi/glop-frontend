import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import AthleteRequestSection from "../../components/AthleteRequestSection";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const [trackingActive, setTrackingActive] = useState(false);
  const [epreuves, setEpreuves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motifModal, setMotifModal] = useState({ open: false, epreuveId: null, nom: "" });
  const [motifText, setMotifText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEpreuves = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/athlete/epreuves");
      setEpreuves(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des épreuves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpreuves();
  }, []);

  const handleResigne = (epreuveId, nom) => {
    setMotifModal({ open: true, epreuveId, nom });
    setMotifText("");
  };

  const submitDesistement = async () => {
    if (!motifText.trim()) {
      alert("Veuillez indiquer un motif pour votre désistement.");
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch(`/desistements/demande?epreuveId=${motifModal.epreuveId}&motif=${encodeURIComponent(motifText)}`, {
        method: "POST"
      });
      alert("Votre demande de désistement a été envoyée au commissaire.");
      setMotifModal({ open: false, epreuveId: null, nom: "" });
      fetchEpreuves();
    } catch (err) {
      alert("Erreur lors de l'envoi de la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user || !navigator.geolocation) return;

    const sendLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await apiFetch("/tracking/update", {
              method: "POST",
              data: {
                athleteId: user.id || user.userId || user.user_id,
                nom: `${user.prenom} ${user.nom}`,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toISOString(),
              },
            });
            setTrackingActive(true);
          } catch (err) {
            setTrackingActive(false);
          }
        },
        (err) => {
          setTrackingActive(false);
        }
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-outfit text-slate-800">Espace Athlète</h2>
        {trackingActive && (
          <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-pulse">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Suivi GPS Actif
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 mb-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white text-xl font-outfit">
            Bonjour <span className="font-bold text-white underline decoration-primary decoration-4 underline-offset-4">{user?.prenom}</span>,
          </p>
          <p className="text-slate-300 text-sm mt-4 max-w-2xl leading-relaxed">
            Conformément aux règles anti-dopage, votre position GPS est partagée en temps réel avec les commissaires officiels.
            Retrouvez ci-dessous le détail de vos épreuves et vos résultats officiels.
          </p>
        </div>
        <div className="absolute top-[-20px] right-[-20px] p-8 text-8xl opacity-10 select-none rotate-12">🏅</div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="mr-3 text-2xl">📅</span> Mon Agenda Olympique
          </h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded italic">
            Note: Présence requise 2h avant le coup d'envoi.
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>)}
          </div>
        ) : epreuves.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
            <p className="text-slate-400">Aucune épreuve programmée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {epreuves.map((ep) => (
              <div key={`${ep.typeParticipation}-${ep.id}`} className={`glass-card p-7 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-white/40 flex flex-col relative overflow-hidden ${ep.statusParticipation === 'DESISTE' ? 'opacity-60 grayscale' : ''}`}>

                {ep.statusEpreuve === 'Terminé' && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter z-20 shadow-sm">
                    Terminée
                  </div>
                )}

                <div className="flex justify-between items-start mb-5 relative z-10">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/5">
                    {ep.discipline}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border ${ep.statusParticipation === 'DESISTE' ? 'bg-red-50 text-red-600 border-red-100' : (ep.desistementAttente ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100')}`}>
                    {ep.statusParticipation === 'DESISTE' ? 'Forfait' : (ep.desistementAttente ? 'Désistement en attente' : 'Inscrit')}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-1 leading-tight" style={{ textAlign: "center", color: "#f1f3f8ff" }}>{ep.nom}</h4>
                <p className="text-xs font-medium text-slate-400 mb-5">{ep.phase} • {ep.genre}</p>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="mr-3 text-base">📍</span> <span className="truncate">{ep.lieuNom}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-700 font-bold bg-white/50 p-2.5 rounded-2xl border border-white/60 shadow-sm">
                    <span className="mr-3 text-base">🕒</span> {new Date(ep.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {ep.heureDebut.substring(0, 5)}
                  </div>
                </div>

                {
                  ep.statusEpreuve === 'Terminé' && ep.resultat ? (
                    <div className="mb-6 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-lg group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Résultat Officiel</span>
                        {ep.resultat.isForfait && <span className="text-[10px] font-black text-red-400 uppercase">FORFAIT</span>}
                      </div>
                      <div className="flex items-end space-x-2">
                        <span className="text-3xl font-black text-white italic">#{ep.resultat.rang}</span>
                        <span className="text-white/60 text-xs mb-1 font-medium">au classement</span>
                      </div>
                      {ep.resultat.score !== null && (
                        <div className="mt-2 text-primary-light text-sm font-bold">
                          {ep.resultat.score} buts marqués
                        </div>
                      )}
                      {ep.resultat.tempsSecondes !== null && (
                        <div className="mt-2 text-white/90 text-sm font-mono">
                          ⏱️ {Math.floor(ep.resultat.tempsSecondes / 60)}m {Math.round(ep.resultat.tempsSecondes % 60)}s
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 p-3 bg-amber-50 rounded-2xl border border-amber-100/50">
                      <div className="flex items-start">
                        <span className="text-base mr-2">💡</span>
                        <p className="text-[11px] text-amber-800 leading-tight font-medium">
                          Rappel : Soyez sur place au plus tard à <span className="font-bold">{(parseInt(ep.heureDebut.split(':')[0]) - 2)}:00</span> pour l'accréditation.
                        </p>
                      </div>
                    </div>
                  )
                }

                <div className="pt-2">
                  {ep.statusParticipation !== 'DESISTE' && !ep.desistementAttente && ep.statusEpreuve === 'Planifié' && (
                    <button
                      onClick={() => handleResigne(ep.id, ep.nom)}
                      className="w-full py-3 rounded-2xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm"
                    >
                      Se désister de l'épreuve
                    </button>
                  )}
                  {ep.desistementAttente && (
                    <div className="w-full py-3 rounded-2xl bg-amber-50 text-amber-700 text-xs font-bold text-center border border-amber-200">
                      Demande de désistement en cours d'examen
                    </div>
                  )}
                  {ep.statusEpreuve === 'Terminé' && (
                    <div className="w-full py-3 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold text-center border border-slate-200 cursor-not-allowed">
                      Épreuve verrouillée
                    </div>
                  )}
                </div>
              </div >
            ))
            }
          </div >
        )}
      </div >

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6 font-outfit">Postuler à d'autres disciplines</h3>
        <AthleteRequestSection />
      </div>

      {/* Modal Motif Désistement */}
      {motifModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Motif du désistement</h3>
              <button 
                onClick={() => setMotifModal({ open: false, epreuveId: null, nom: "" })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Vous demandez à vous désister de l'épreuve <span className="font-bold text-slate-700">"{motifModal.nom}"</span>. 
                Veuillez expliquer au commissaire la raison de votre désistement.
              </p>
              <textarea
                className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all outline-none resize-none text-sm text-slate-700"
                placeholder="Ex: Blessure, empêchement majeur, etc..."
                value={motifText}
                onChange={(e) => setMotifText(e.target.value)}
                autoFocus
              ></textarea>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-4">
              <button
                onClick={() => setMotifModal({ open: false, epreuveId: null, nom: "" })}
                className="flex-1 py-3 px-6 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={submitDesistement}
                className="flex-[2] py-3 px-6 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Envoyer la demande"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
