import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../api/apiClient";
import { ROLES } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";

export default function ResultatsEpreuve() {
    const { id } = useParams();
    const { user } = useAuth();

    const [epreuve, setEpreuve] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [resultats, setResultats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    // Input states for each participant
    // format: { athleteId: { value: string } }
    const [inputs, setInputs] = useState({});

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Epreuve details
            const epRes = await apiFetch(`/events/${id}`);
            setEpreuve(epRes.data);

            // 2. Fetch Participants for this Epreuve
            const partRes = await apiFetch(`/epreuves/${id}/participants`);
            setParticipants(partRes.data || []);

            // 3. Fetch Existing Results for this Epreuve
            const resRes = await apiFetch(`/epreuves/${id}/resultats`);
            setResultats(resRes.data || []);

            // Initialize inputs from existing results if they exist
            const initialInputs = {};
            (resRes.data || []).forEach(res => {
                if (res.athlete && res.athlete.id) {
                    let val = "";
                    if (res.temps) val = res.temps;
                    if (res.score != null) val = res.score.toString();
                    if (res.points != null) val = res.points.toString();
                    initialInputs[res.athlete.id] = { value: val };
                }
            });
            setInputs(initialInputs);

        } catch (err) {
            console.error("Error loading data:", err);
            setError("Erreur lors du chargement des données. Veuillez vérifier que c'est bien une épreuve et non une compétition générale.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (athleteId, value) => {
        setInputs(prev => ({
            ...prev,
            [athleteId]: { value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg("");

        // Prepare payload
        // Filter out empty inputs
        const payload = Object.keys(inputs)
            .filter(athleteId => inputs[athleteId].value && inputs[athleteId].value.trim() !== "")
            .map(athleteId => {
                const val = inputs[athleteId].value;
                const result = { athleteId: athleteId };

                // Determine input type based on Epreuve discipline (simplified logic)
                // Adjust these keywords based on your actual database data
                const disc = (epreuve?.discipline || epreuve?.type || "").toLowerCase();

                if (disc.includes("water") || disc.includes("polo")) {
                    result.score = parseInt(val, 10);
                } else if (disc.includes("plongeon") || disc.includes("artistique")) {
                    result.points = parseFloat(val);
                } else {
                    // Default to time for swimming races, relays, etc.
                    result.temps = val;
                }

                return result;
            });

        if (payload.length === 0) {
            setError("Veuillez saisir au moins un résultat.");
            return;
        }

        try {
            await apiFetch(`/epreuves/${id}/resultats`, {
                method: "POST",
                data: payload
            });
            setSuccessMsg("Résultats soumis avec succès ! Le classement a été mis à jour.");
            await loadData(); // Reload to get updated rankings and status
        } catch (err) {
            console.error("Error submitting results:", err);
            setError(err.response?.data?.message || err.response?.data || "Erreur lors de la soumission des résultats.");
        }
    };

    const handleValidate = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir valider définitivement ces résultats ?")) return;
        setError(null);
        setSuccessMsg("");

        try {
            await apiFetch(`/epreuves/${id}/resultats/validate`, {
                method: "POST"
            });
            setSuccessMsg("Résultats validés avec succès !");
            await loadData();
        } catch (err) {
            console.error("Error validating results:", err);
            setError(err.response?.data?.message || err.response?.data || "Erreur lors de la validation des résultats.");
        }
    };

    if (loading) return <div className="p-6">Chargement des données...</div>;
    if (error && !epreuve) return <div className="p-6 text-red-600">{error}</div>;
    if (!epreuve) return <div className="p-6">Épreuve introuvable.</div>;

    const isValide = resultats.length > 0 && resultats[0].statut === "VALIDE";
    const disc = (epreuve?.discipline || epreuve?.type || "").toLowerCase();

    let inputLabel = "Temps (ex: PT1M30S ou 01:30.00)";
    let inputType = "text";
    if (disc.includes("water") || disc.includes("polo")) {
        inputLabel = "Score (Buts)";
        inputType = "number";
    } else if (disc.includes("plongeon") || disc.includes("artistique")) {
        inputLabel = "Points";
        inputType = "number";
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link to={`/events/${id}`} className="text-gray-500 hover:text-gray-700">← Retour</Link>
                <h2 className="text-2xl font-bold flex-1">Gestion des Résultats : {epreuve.nom}</h2>
                {isValide ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold uppercase text-sm border border-green-200 shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Résultats Validés
                    </span>
                ) : resultats.length > 0 ? (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold uppercase text-sm border border-yellow-200">
                        Classement Proposé
                    </span>
                ) : (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold uppercase text-sm border border-gray-200">
                        En Attente
                    </span>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded shadow-sm border border-red-200">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded shadow-sm border border-green-200">{successMsg}</div>}

            <div className="grid md:grid-cols-2 gap-8">

                {/* Section de saisie */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Saisie des Performances</h3>
                    {participants.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucun participant inscrit à cette épreuve.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {participants.map(p => (
                                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800">{p.nom} {p.prenom}</div>
                                            <div className="text-xs text-gray-500 uppercase font-medium">{p.nation}</div>
                                        </div>
                                        <div className="w-full sm:w-1/3">
                                            <input
                                                type={inputType}
                                                step={inputType === "number" && inputLabel === "Points" ? "0.01" : "1"}
                                                placeholder={inputLabel}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border disabled:bg-gray-100 disabled:cursor-not-allowed text-right font-mono"
                                                value={inputs[p.id]?.value || ""}
                                                onChange={(e) => handleInputChange(p.id, e.target.value)}
                                                disabled={isValide}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!isValide && participants.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Calculer le Classement
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </section>

                {/* Section de classement */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex justify-between items-center">
                        Classement
                        {resultats.length > 0 && (
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Basé sur {disc}</span>
                        )}
                    </h3>

                    {resultats.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500 italic">Aucun résultat soumis pour le moment. Renseignez les performances à gauche.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Rang</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Athlète</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Perf.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {resultats.map((res, idx) => (
                                            <tr key={res.id} className={idx < 3 ? "bg-amber-50/30" : ""}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm
                                                    ${res.rang === 1 ? "bg-yellow-400 text-yellow-900 shadow-sm" :
                                                                res.rang === 2 ? "bg-gray-300 text-gray-800 shadow-sm" :
                                                                    res.rang === 3 ? "bg-amber-600 text-amber-50 shadow-sm" :
                                                                        "bg-gray-100 text-gray-600"}`}>
                                                            {res.rang}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{res.athlete?.prenom} {res.athlete?.nom}</div>
                                                    <div className="text-xs text-gray-500">{res.athlete?.nation}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-medium text-gray-900">
                                                    {res.temps && res.temps}
                                                    {res.score != null && `${res.score} buts`}
                                                    {res.points != null && `${res.points} pts`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!isValide && user?.roles?.includes(ROLES.COMMISSAIRE) && (
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleValidate}
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Valider Définitivement
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
