import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiClient";

export default function CommissaireWithdrawalRequests() {
  const [desistements, setDesistements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDesistements = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/desistements/commissaire/en-attente");
      setDesistements(res.data || []);
    } catch (err) {
      console.error("Erreur desistements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesistements();
  }, []);

  const handleAction = async (id, action, motif = "") => {
    try {
      const path = action === "accepter" ? `/${id}/accepter` : `/${id}/refuser?motif=${encodeURIComponent(motif)}`;
      await apiFetch(`/desistements${path}`, { method: "POST" });
      alert(action === "accepter" ? "Désistement approuvé." : "Demande refusée.");
      fetchDesistements();
    } catch (e) {
      alert("Erreur lors de l'opération.");
    }
  };

  if (loading) return <p className="text-slate-500 animate-pulse">Chargement des désistements...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800">
        <span className="mr-2">⚖️</span> Demandes de Désistement
      </h2>
      <p className="text-xs text-slate-500 mb-6 font-medium italic">
        Validation requise pour appliquer les forfaits et mettre à jour les scores.
      </p>
      
      {desistements.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 italic text-sm">Aucune demande de désistement en attente pour vos disciplines.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b">
                <th className="p-4 font-bold text-slate-700 text-[10px] uppercase tracking-wider">Athlète</th>
                <th className="p-4 font-bold text-slate-700 text-[10px] uppercase tracking-wider">Épreuve / Discipline</th>
                <th className="p-4 font-bold text-slate-700 text-[10px] uppercase tracking-wider">Motif</th>
                <th className="p-4 font-bold text-slate-700 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {desistements.map((d) => (
                <tr key={d.id} className="border-b hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{d.user.prenom} {d.user.nom}</div>
                    <div className="text-[10px] text-slate-400">{d.user.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-blue-600 text-sm">{d.epreuve.nom}</div>
                    <div className="text-[10px] text-slate-400">{d.epreuve.discipline}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-600 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/50 italic max-w-xs break-words">
                      "{d.motif}"
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (window.confirm("Approuver ce désistement ? Les résultats seront mis à jour en forfait.")) {
                            handleAction(d.id, "accepter");
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => {
                          const m = prompt("Motif du refus :");
                          if (m) handleAction(d.id, "refuser", m);
                        }}
                        className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-all"
                      >
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
