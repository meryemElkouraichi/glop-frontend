import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import AthleteRequestSection from "../../components/AthleteRequestSection";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const [trackingActive, setTrackingActive] = useState(false);
  const [epreuves, setEpreuves] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleResigne = async (epreuveId, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir vous résilier de l'épreuve "${nom}" ?\nCette action entraînera un forfait (0-3 pour les matchs).`)) return;

    try {
      await apiFetch(`/athlete/epreuves/${epreuveId}/resigne`, { method: "POST" });
      alert("Votre désistement a été enregistré.");
      fetchEpreuves();
    } catch (err) {
      alert("Erreur lors du désistement.");
    }
  };

  useEffect(() => {
    if (!user || !navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await apiFetch("/tracking/update", {
              method: "POST",
              data: {
                athleteId: user.id || user.user_id,
                nom: `${user.prenom} ${user.nom}`,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
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
              <div key={ep.id} className={`glass-card p-7 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-white/40 flex flex-col relative overflow-hidden ${ep.statusParticipation === 'DESISTE' ? 'opacity-60 grayscale' : ''}`}>

                {ep.statusEpreuve === 'Terminé' && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter z-20 shadow-sm">
                    Terminée
                  </div>
                )}

                <div className="flex justify-between items-start mb-5 relative z-10">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/5">
                    {ep.discipline}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border ${ep.statusParticipation === 'DESISTE' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {ep.statusParticipation === 'DESISTE' ? 'Forfait' : 'Inscrit'}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{ep.nom}</h4>
                <p className="text-xs font-medium text-slate-400 mb-5">{ep.phase} • {ep.genre}</p>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="mr-3 text-base">📍</span> <span className="truncate">{ep.lieuNom}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-700 font-bold bg-white/50 p-2.5 rounded-2xl border border-white/60 shadow-sm">
                    <span className="mr-3 text-base">🕒</span> {new Date(ep.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {ep.heureDebut.substring(0, 5)}
                  </div>
                </div>

                {ep.statusEpreuve === 'Terminé' && ep.resultat ? (
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
                )}

                <div className="pt-2">
                  {ep.statusParticipation !== 'DESISTE' && ep.statusEpreuve === 'Planifié' && (
                    <button
                      onClick={() => handleResigne(ep.id, ep.nom)}
                      className="w-full py-3 rounded-2xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm"
                    >
                      Se résilier de l'épreuve
                    </button>
                  )}
                  {ep.statusEpreuve === 'Terminé' && (
                    <div className="w-full py-3 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold text-center border border-slate-200 cursor-not-allowed">
                      Épreuve verrouillée
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6 font-outfit">Postuler à d'autres disciplines</h3>
        <AthleteRequestSection />
      </div>
    </div>
  );
}
