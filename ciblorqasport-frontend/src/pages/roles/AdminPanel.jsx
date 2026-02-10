import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

export default function AdminPanel() {
  const { user } = useAuth();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);

  // active tab: 'home' | 'competition' | 'epreuve' | 'ceremonie' | 'analytics' | 'alerte'
  const [tab, setTab] = useState("home");

  // Competition form state
  const [compName, setCompName] = useState("");
  const [compStart, setCompStart] = useState("");
  const [compStartTime, setCompStartTime] = useState("");
  const [compEnd, setCompEnd] = useState("");
  const [compEndTime, setCompEndTime] = useState("");
  const [compCountry, setCompCountry] = useState("");
  const [compSport, setCompSport] = useState("");
  const [compErrors, setCompErrors] = useState([]);
  const [compSuccess, setCompSuccess] = useState("");

  // Epreuve form state
  const [epName, setEpName] = useState("");
  const [epCompetition, setEpCompetition] = useState("");
  const [epSport, setEpSport] = useState("");
  const [epDate, setEpDate] = useState("");
  const [epStartTime, setEpStartTime] = useState("");
  const [epEndTime, setEpEndTime] = useState("");
  const [epLocation, setEpLocation] = useState("");
  const [epErrors, setEpErrors] = useState([]);
  const [epSuccess, setEpSuccess] = useState("");

  // Cérémonie form state
  const [cerName, setCerName] = useState("");
  const [cerCompetition, setCerCompetition] = useState("");
  const [cerDate, setCerDate] = useState("");
  const [cerStartTime, setCerStartTime] = useState("");
  const [cerEndTime, setCerEndTime] = useState("");
  const [cerLocation, setCerLocation] = useState("");
  const [cerType, setCerType] = useState("");
  const [cerDescription, setCerDescription] = useState("");
  const [cerErrors, setCerErrors] = useState([]);
  const [cerSuccess, setCerSuccess] = useState("");

  // Alerte sécurité form state
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertLevel, setAlertLevel] = useState("");
  const [alertLocation, setAlertLocation] = useState("");
  const [alertErrors, setAlertErrors] = useState([]);
  const [alertSuccess, setAlertSuccess] = useState("");

  // Incidents list state
  const [incidents, setIncidents] = useState([]);

  // List of competitions for selection
  const [competitions, setCompetitions] = useState([]);

  // Épreuve du jour (mock)
  const [epDay] = useState([
    { id: 1, name: "50m Libre Hommes (Natation)", status: "en_cours", sport: "Natation" },
    { id: 2, name: "100m Papillon Femmes (Natation)", status: "fini", sport: "Natation" },
    { id: 3, name: "4x100 Relais Mixte (Natation)", status: "reprogramme", sport: "Natation" },
    { id: 4, name: "200m Dos Hommes (Natation)", status: "fini", sport: "Natation" },
  ]);

  useEffect(() => {
    apiFetch("/analytics").then((r) => {
      if (r && r.data) {
        setAnalytics(r.data);
      } else {
        setAnalytics({
          dailyActive: ["Suzanne", "Léon", "Arthur"],
          avgSession: 12,
        });
      }
    });
  }, []);

  // Charger les incidents
  const loadIncidents = () => {
    apiFetch("/incidents").then((r) => {
      if (r && Array.isArray(r.data)) {
        setIncidents(r.data);
      }
    });
  };

  const loadCompetitions = () => {
    apiFetch("/competitions").then((r) => {
      if (r && Array.isArray(r.data)) {
        setCompetitions(r.data);
      }
    });
  };

  useEffect(() => {
    loadIncidents();
    loadCompetitions();
  }, []);

  const resolveIncident = async (incidentId) => {
    try {
      await apiFetch(`/incidents/${incidentId}/resolve`, { method: "PUT" });
      loadIncidents(); // Recharger la liste
      setAlertSuccess("Incident résolu et notifications envoyées !");
    } catch (error) {
      console.error("Erreur lors de la résolution:", error);
      setAlertErrors(["Erreur lors de la résolution de l'incident"]);
    }
  };

  useEffect(() => {
    if (location && location.hash) {
      const h = location.hash.replace('#', '');
      if (h) setTab(h);
    }
  }, [location]);

  const validateCompetition = () => {
    const e = [];
    if (!compName.trim()) e.push("Le nom de la compétition est requis.");
    if (!compStart) e.push("La date de début est requise.");
    if (!compEnd) e.push("La date de fin est requise.");
    if (!compSport.trim()) e.push("Le sport associé est requis.");
    if (!compCountry.trim()) e.push("Le pays organisateur est requis.");
    return e;
  };

  const submitCompetition = async (ev) => {
    ev.preventDefault();
    setCompErrors([]);
    setCompSuccess("");
    const e = validateCompetition();
    if (e.length) {
      setCompErrors(e);
      return;
    }

    const competitionData = {
      typeObjet: "COMPETITION",
      nom: compName,
      type: compSport,
      dateDebut: compStart,
      dateFin: compEnd,
      paysOrganisateur: compCountry,
      status: "Planifié"
    };

    try {
      await apiFetch("/competitions", {
        method: "POST",
        data: competitionData
      });
      setCompSuccess("Compétition créée avec succès !");
      setCompName(""); setCompStart(""); setCompStartTime(""); setCompEnd(""); setCompEndTime(""); setCompCountry(""); setCompSport("");
      loadCompetitions(); // Refresh list
    } catch (error) {
      console.error("Erreur création compétition:", error);
      setCompErrors(["Erreur lors de la création de la compétition sur le serveur."]);
    }
  };

  const validateEpreuve = () => {
    const e = [];
    if (!epName.trim()) e.push("Le nom de l'épreuve est requis.");
    if (!epCompetition.trim()) e.push("La compétition associée est requise.");
    if (!epSport.trim()) e.push("Le sport associé est requis.");
    if (!epDate) e.push("La date de l'épreuve est requise.");
    if (!epStartTime) e.push("L'heure de début est requise pour l'épreuve.");
    if (!epEndTime) e.push("L'heure de fin est requise pour l'épreuve.");
    if (epDate && epStartTime && epEndTime) {
      const s = new Date(epDate + "T" + epStartTime);
      const en = new Date(epDate + "T" + epEndTime);
      if (s > en) e.push("L'heure de début doit être antérieure ou égale à l'heure de fin pour l'épreuve.");
    }
    if (!epLocation.trim()) e.push("Le lieu est requis.");
    return e;
  };

  const submitEpreuve = async (ev) => {
    ev.preventDefault();
    setEpErrors([]);
    setEpSuccess("");
    const e = validateEpreuve();
    if (e.length) {
      setEpErrors(e);
      return;
    }

    const epreuveData = {
      typeObjet: "EPREUVE",
      nom: epName,
      type: epSport, // On utilise le sport comme type
      dateDebut: epDate,
      dateFin: epDate, // Même date pour une épreuve simple
      heureDebut: epStartTime,
      heureFin: epEndTime,
      lieuSpecifique: epLocation,
      status: "Planifié"
    };

    try {
      await apiFetch(`/competitions/${epCompetition}/children`, {
        method: "POST",
        data: epreuveData
      });
      setEpSuccess("Épreuve créée avec succès !");
      setEpName(""); setEpCompetition(""); setEpDate(""); setEpStartTime(""); setEpEndTime(""); setEpSport(""); setEpLocation("");
    } catch (error) {
      console.error("Erreur création épreuve:", error);
      setEpErrors(["Erreur lors de la création de l'épreuve. Vérifiez les dates par rapport à la compétition."]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {!(user && user.roles && user.roles.includes(ROLES.ADMIN)) && (
          <aside className="w-64 fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-auto bg-transparent">
            <nav className="bg-white rounded shadow p-3 space-y-2">
              <button
                className={`w-full text-left p-2 rounded ${tab === "competition" ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setTab("competition")}
              >
                Compétitions
              </button>
              <button
                className={`w-full text-left p-2 rounded ${tab === "epreuve" ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setTab("epreuve")}
              >
                Épreuves
              </button>
              <button
                className={`w-full text-left p-2 rounded ${tab === "ceremonie" ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setTab("ceremonie")}
              >
                Cérémonies
              </button>
              <button
                className={`w-full text-left p-2 rounded ${tab === "analytics" ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setTab("analytics")}
              >
                Analyses & Statistiques
              </button>
            </nav>
          </aside>
        )}

        <section className="flex-1 ml-80">
          {tab !== 'home' && (
            <div className="mb-4">
              <button onClick={() => { setTab('home'); window.location.hash = ''; }} className="text-sm text-blue-600">← Retour</button>
            </div>
          )}
          {tab === "home" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Bienvenue, espace Administrateur</h4>
              <p className="mb-3">Épreuve du jour</p>
              <div className="space-y-2">
                {epDay.map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between p-3 border rounded">
                    <div>{ep.name}</div>
                    <div>
                      {ep.status === 'fini' && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Fini</span>}
                      {ep.status === 'en_cours' && <span className="text-xs bg-green-200 px-2 py-1 rounded">En cours</span>}
                      {ep.status === 'reprogramme' && <span className="text-xs bg-yellow-200 px-2 py-1 rounded">Reprogrammé</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "competition" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Créer une compétition</h4>
              <form onSubmit={submitCompetition} className="space-y-3">
                <div>
                  <label className="block text-sm">Nom</label>
                  <input value={compName} onChange={(e) => setCompName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm">Date de début</label>
                    <input type="date" value={compStart} onChange={(e) => setCompStart(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Date de fin</label>
                    <input type="date" value={compEnd} onChange={(e) => setCompEnd(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm">Sport</label>
                  <input value={compSport} onChange={(e) => setCompSport(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Pays organisateur</label>
                  <input value={compCountry} onChange={(e) => setCompCountry(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>

                {compErrors.length > 0 && <div className="text-red-600">{compErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {compSuccess && <div className="text-green-600">{compSuccess}</div>}

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
                </div>
              </form>
            </div>
          )}

          {tab === "epreuve" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Créer une épreuve</h4>
              <form onSubmit={submitEpreuve} className="space-y-3">
                <div>
                  <label className="block text-sm">Nom de l'épreuve</label>
                  <input value={epName} onChange={(e) => setEpName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Compétition associée</label>
                  <select
                    value={epCompetition}
                    onChange={(e) => setEpCompetition(e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  >
                    <option value="">-- Choisir une compétition --</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Sport</label>
                  <input value={epSport} onChange={(e) => setEpSport(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm">Date</label>
                    <input type="date" value={epDate} onChange={(e) => setEpDate(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure début</label>
                    <input type="time" value={epStartTime} onChange={(e) => setEpStartTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure fin</label>
                    <input type="time" value={epEndTime} onChange={(e) => setEpEndTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Lieu</label>
                    <input value={epLocation} onChange={(e) => setEpLocation(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </div>

                {epErrors.length > 0 && <div className="text-red-600">{epErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {epSuccess && <div className="text-green-600">{epSuccess}</div>}

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
                </div>
              </form>
            </div>
          )}

          {tab === "ceremonie" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Créer une cérémonie</h4>
              <form onSubmit={async (ev) => {
                ev.preventDefault();
                setCerErrors([]);
                setCerSuccess("");
                const e = [];
                if (!cerName.trim()) e.push("Le nom de la cérémonie est requis.");
                if (!cerDate) e.push("La date est requise.");
                if (!cerStartTime) e.push("L'heure de début est requise.");
                if (!cerEndTime) e.push("L'heure de fin est requise.");
                if (cerDate && cerStartTime && cerEndTime) {
                  const s = new Date(cerDate + "T" + cerStartTime);
                  const en = new Date(cerDate + "T" + cerEndTime);
                  if (s > en) e.push("L'heure de début doit être antérieure ou égale à l'heure de fin pour la cérémonie.");
                }
                if (!cerType) e.push("Le type de cérémonie est requis.");
                if (!cerLocation.trim()) e.push("Le lieu est requis.");
                if (e.length) { setCerErrors(e); return; }

                const mapCerType = (t) => {
                  if (t === "remise_prix") return "REMISE_MEDAILLES";
                  return t.toUpperCase();
                };

                const ceremonieData = {
                  typeObjet: "CEREMONIE",
                  nom: cerName,
                  type: "Cérémonie",
                  dateDebut: cerDate,
                  dateFin: cerDate,
                  heureDebut: cerStartTime,
                  heureFin: cerEndTime,
                  paysOrganisateur: cerLocation,
                  status: "Planifié",
                  typeCeremonie: mapCerType(cerType)
                };

                try {
                  const url = cerCompetition
                    ? `/competitions/${cerCompetition}/children`
                    : "/events"; // Fallback to generic events if no competition

                  await apiFetch(url, {
                    method: "POST",
                    data: ceremonieData
                  });
                  setCerSuccess("Cérémonie créée avec succès !");
                  setCerName(""); setCerDate(""); setCerStartTime(""); setCerEndTime(""); setCerType(""); setCerLocation(""); setCerDescription(""); setCerCompetition("");
                } catch (error) {
                  console.error("Erreur création cérémonie:", error);
                  setCerErrors(["Erreur lors de la création de la cérémonie sur le serveur."]);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-sm">Nom de la cérémonie</label>
                  <input value={cerName} onChange={(e) => setCerName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Compétition associée (Optionnel)</label>
                  <select
                    value={cerCompetition}
                    onChange={(e) => setCerCompetition(e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  >
                    <option value="">-- Sans compétition --</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm">Date</label>
                    <input type="date" value={cerDate} onChange={(e) => setCerDate(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure début</label>
                    <input type="time" value={cerStartTime} onChange={(e) => setCerStartTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure fin</label>
                    <input type="time" value={cerEndTime} onChange={(e) => setCerEndTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Lieu</label>
                    <input value={cerLocation} onChange={(e) => setCerLocation(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm">Type de cérémonie</label>
                  <select value={cerType} onChange={(e) => setCerType(e.target.value)} className="mt-1 block w-full border rounded p-2">
                    <option value="">-- Choisir --</option>
                    <option value="ouverture">Cérémonie d'ouverture</option>
                    <option value="cloture">Cérémonie de clôture</option>
                    <option value="remise_prix">Cérémonie de remise de prix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Lieu</label>
                  <input value={cerLocation} onChange={(e) => setCerLocation(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Description (optionnel)</label>
                  <textarea value={cerDescription} onChange={(e) => setCerDescription(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={4} />
                </div>

                {cerErrors.length > 0 && <div className="text-red-600">{cerErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {cerSuccess && <div className="text-green-600">{cerSuccess}</div>}

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
                </div>
              </form>
            </div>
          )}

          {tab === "analytics" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Analyses & Statistiques d'usage</h4>
              {analytics ? (
                <div className="space-y-2">
                  <div>Utilisateurs actifs : {analytics.dailyActive.join(", ")}</div>
                  <div>Durée moyenne : {analytics.avgSession} min</div>
                </div>
              ) : (
                <p>Chargement...</p>
              )}
            </div>
          )}
          {tab === 'alerte' && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Créer une alerte sécurité</h4>
              <form onSubmit={(ev) => {
                ev.preventDefault();
                setAlertErrors([]);
                setAlertSuccess("");
                const e = [];
                if (!alertTitle.trim()) e.push("Le titre est requis.");
                if (!alertLevel) e.push("Le niveau est requis.");
                if (e.length) { setAlertErrors(e); return; }

                const mapLevel = (l) => {
                  if (l === 'critique') return 'CRITIQUE';
                  if (l === 'alerte') return 'IMPORTANT';
                  return 'INFORMATIONNEL';
                };

                apiFetch("/incidents", {
                  method: "POST",
                  data: {
                    description: alertTitle + " : " + alertDescription,
                    lieu: alertLocation || "Non spécifié",
                    level: mapLevel(alertLevel)
                  }
                }).then(() => {
                  setAlertSuccess("Alerte publiée et notifications envoyées !");
                  setAlertTitle("");
                  setAlertDescription("");
                  setAlertLevel("");
                  setAlertLocation("");
                  loadIncidents(); // Recharger la liste des incidents
                }).catch(err => {
                  console.error("Axios check - Error:", err);
                  if (err.response) {
                    console.error("Axios check - Status:", err.response.status);
                    console.error("Axios check - Data:", err.response.data);
                  } else if (err.request) {
                    console.error("Axios check - No response received (Network Error?)");
                  }
                  setAlertErrors(["Erreur technique : " + (err.response?.data?.message || err.message)]);
                });

              }} className="space-y-3">
                <div>
                  <label className="block text-sm">Titre</label>
                  <input value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Niveau</label>
                  <select value={alertLevel} onChange={(e) => setAlertLevel(e.target.value)} className="mt-1 block w-full border rounded p-2">
                    <option value="">-- Choisir --</option>
                    <option value="info">Info (Spectateurs)</option>
                    <option value="alerte">Alerte (Staff/Athlètes)</option>
                    <option value="critique">Critique (Tout le monde)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Lieu (Optionnel)</label>
                  <input value={alertLocation} onChange={(e) => setAlertLocation(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="Ex: Piscine Olympique" />
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <textarea value={alertDescription} onChange={(e) => setAlertDescription(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={4} />
                </div>
                {alertErrors.length > 0 && <div className="text-red-600">{alertErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {alertSuccess && <div className="text-green-600">{alertSuccess}</div>}
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Publier l'alerte</button>
                </div>
              </form>

              {/* Liste des incidents */}
              <div className="mt-6 border-t pt-4">
                <h5 className="text-md font-medium mb-3">Incidents en cours</h5>
                {incidents.length === 0 ? (
                  <p className="text-gray-500">Aucun incident.</p>
                ) : (
                  <ul className="space-y-2">
                    {incidents.map((inc) => (
                      <li key={inc.id} className={`p-3 border rounded flex justify-between items-center ${inc.status === 'RESOLU' ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${inc.level === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
                              inc.level === 'IMPORTANT' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {inc.level}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${inc.status === 'RESOLU' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {inc.status === 'RESOLU' ? '✅ Résolu' : '⚠️ En cours'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{inc.description}</p>
                          <p className="text-xs text-gray-500">{inc.lieu} • {new Date(inc.dateCreation).toLocaleString()}</p>
                        </div>
                        {inc.status !== 'RESOLU' && (
                          <button
                            onClick={() => resolveIncident(inc.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Résoudre
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
