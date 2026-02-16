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
  const [editingCompId, setEditingCompId] = useState(null);

  // Epreuve form state
  const [epName, setEpName] = useState("");
  const [epCompetition, setEpCompetition] = useState("");
  const [epDiscipline, setEpDiscipline] = useState("");
  const [epGenre, setEpGenre] = useState("");
  const [epDate, setEpDate] = useState("");
  const [epStartTime, setEpStartTime] = useState("");
  const [epEndTime, setEpEndTime] = useState("");
  const [epLieuId, setEpLieuId] = useState("");
  const [epErrors, setEpErrors] = useState([]);
  const [epSuccess, setEpSuccess] = useState("");
  const [editingEpId, setEditingEpId] = useState(null);

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

  // List of distinct sports for selection
  const [sportList, setSportList] = useState([]);

  // List of countries for selection
  const [countries, setCountries] = useState([]);

  // List of distinct disciplines for selection
  const [disciplineList, setDisciplineList] = useState([]);

  // List of distinct genres for selection
  const [genreList, setGenreList] = useState([]);

  // List of locations for selection
  const [lieuList, setLieuList] = useState([]);

  // List of epreuves for display
  const [epreuvesList, setEpreuvesList] = useState([]);

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

  const loadSports = () => {
    apiFetch("/sports/distinct").then((r) => {
      if (r && Array.isArray(r.data)) {
        setSportList(r.data);
      }
    });
  };

  const loadCountries = () => {
    apiFetch("/pays").then((r) => {
      if (r && Array.isArray(r.data)) {
        setCountries(r.data);
      }
    });
  };

  const loadDisciplines = () => {
    apiFetch("/sports/disciplines/distinct").then((r) => {
      if (r && Array.isArray(r.data)) {
        setDisciplineList(r.data);
      }
    });
  };

  const loadGenres = () => {
    apiFetch("/sports/genres/distinct").then((r) => {
      if (r && Array.isArray(r.data)) {
        setGenreList(r.data);
      }
    });
  };

  const loadLieux = () => {
    apiFetch("/lieux").then((r) => {
      if (r && Array.isArray(r.data)) {
        setLieuList(r.data);
      }
    });
  };

  const loadEpreuves = () => {
    apiFetch("/epreuves").then((r) => {
      if (r && Array.isArray(r.data)) {
        setEpreuvesList(r.data);
      }
    }).catch(err => {
      console.error("Error loading epreuves:", err);
    });
  };

  useEffect(() => {
    loadIncidents();
    loadCompetitions();
    loadSports();
    loadCountries();
    loadDisciplines();
    loadGenres();
    loadLieux();
    loadEpreuves();
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
    if (compStart && compEnd && new Date(compStart) > new Date(compEnd)) {
      e.push("La date de début doit être antérieure à la date de fin.");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (compStart && new Date(compStart) < today) {
      e.push("La date de début ne peut pas être dans le passé.");
    }
    if (compEnd && new Date(compEnd) < today) {
      e.push("La date de fin ne peut pas être dans le passé.");
    }
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
      if (editingCompId) {
        await apiFetch(`/competitions/${editingCompId}`, {
          method: "PUT",
          data: competitionData
        });
        setCompSuccess("Compétition mise à jour !");
      } else {
        await apiFetch("/competitions", {
          method: "POST",
          data: competitionData
        });
        setCompSuccess("Compétition créée !");
      }
      setCompName(""); setCompStart(""); setCompEnd(""); setCompCountry(""); setCompSport("");
      setEditingCompId(null);
      loadCompetitions();
    } catch (error) {
      setCompErrors(["Erreur lors de l'enregistrement."]);
    }
  };

  const deleteCompetition = async (id) => {
    if (!window.confirm("Supprimer cette compétition ?")) return;
    try {
      await apiFetch(`/competitions/${id}`, { method: "DELETE" });
      loadCompetitions();
    } catch (e) {
      alert("Erreur suppression");
    }
  };

  const editCompetition = (c) => {
    setEditingCompId(c.id);
    setCompName(c.nom);
    setCompStart(c.dateDebut);
    setCompEnd(c.dateFin);
    setCompSport(c.type);
    setCompCountry(c.paysOrganisateur);
    setCompSuccess("");
    setCompErrors([]);
  };

  const calculateDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const validateEpreuve = () => {
    const e = [];
    if (!epName.trim()) e.push("Le nom de l'épreuve est requis.");
    if (!epCompetition.trim()) e.push("La compétition associée est requise.");
    if (!epDiscipline.trim()) e.push("La discipline est requise.");
    if (!epGenre.trim()) e.push("Le genre est requis.");
    if (!epDate) e.push("La date de l'épreuve est requise.");
    if (!epStartTime) e.push("L'heure de début est requise pour l'épreuve.");
    if (!epEndTime) e.push("L'heure de fin est requise pour l'épreuve.");
    if (epDate && epStartTime && epEndTime) {
      const s = new Date(epDate + "T" + epStartTime);
      const en = new Date(epDate + "T" + epEndTime);
      if (s > en) e.push("L'heure de début doit être antérieure ou égale à l'heure de fin pour l'épreuve.");
    }
    if (!epLieuId) e.push("Le lieu est requis.");
    if (epDate && epCompetition) {
      const comp = competitions.find(c => c.id === epCompetition);
      if (comp) {
        const dDate = new Date(epDate);
        const dStart = new Date(comp.dateDebut);
        const dEnd = new Date(comp.dateFin);
        if (dDate < dStart || dDate > dEnd) {
          e.push(`La date de l'épreuve doit être comprise entre le ${comp.dateDebut} et le ${comp.dateFin}.`);
        }
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (epDate && new Date(epDate) < today) {
      e.push("La date de l'épreuve ne peut pas être dans le passé.");
    }
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

    const selectedComp = competitions.find(c => c.id === epCompetition);

    const epreuveData = {
      typeObjet: "EPREUVE",
      nom: epName,
      type: (selectedComp && selectedComp.type) ? selectedComp.type : "Sport", // Fallback type
      discipline: epDiscipline,
      genre: epGenre,
      dateDebut: epDate,
      dateFin: epDate,
      heureDebut: epStartTime,
      heureFin: epEndTime,
      lieu: epLieuId ? { id: epLieuId } : null,
      parent: epCompetition ? { id: epCompetition, typeObjet: "COMPETITION" } : null,
      status: editingEpId ? "Planifié" : "Planifié" // Keeping existing status logic simplified for now
    };

    try {
      if (editingEpId) {
        await apiFetch(`/epreuves/${editingEpId}`, {
          method: "PUT",
          data: epreuveData
        });
      } else {
        await apiFetch(`/competitions/${epCompetition}/children`, {
          method: "POST",
          data: epreuveData
        });
      }
      setEpSuccess(editingEpId ? "Épreuve mise à jour !" : "Épreuve créée avec succès !");
      setEpName(""); setEpCompetition(""); setEpDate(""); setEpStartTime(""); setEpEndTime(""); setEpDiscipline(""); setEpGenre(""); setEpLieuId("");
      setEditingEpId(null);
      loadEpreuves();
    } catch (error) {
      console.error("Erreur enregistrement épreuve:", error);
      const msg = error.response?.data || "Erreur lors de l'enregistrement de l'épreuve. Vérifiez les dates par rapport à la compétition.";
      setEpErrors([typeof msg === 'string' ? msg : "Erreur serveur."]);
    }
  };

  const deleteEpreuve = async (id) => {
    if (!window.confirm("Supprimer cette épreuve ?")) return;
    try {
      await apiFetch(`/epreuves/${id}`, { method: "DELETE" });
      loadEpreuves();
    } catch (e) {
      alert("Erreur suppression");
    }
  };

  const editEpreuve = (ep) => {
    setEditingEpId(ep.id);
    setEpName(ep.nom);
    setEpCompetition(ep.parent ? ep.parent.id : "");
    setEpDiscipline(ep.discipline || "");
    setEpGenre(ep.genre || "");
    setEpDate(ep.dateDebut || "");
    setEpStartTime(ep.heureDebut || "");
    setEpEndTime(ep.heureFin || "");
    setEpLieuId(ep.lieu ? ep.lieu.id : "");
    setEpSuccess("");
    setEpErrors([]);
  };

  const addParticipants = (ep) => {
    // TODO: Implement add participants functionality
    alert("Fonctionnalité d'ajout de participants à venir");
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

        <section className={`flex-1 ${!(user && user.roles && user.roles.includes(ROLES.ADMIN)) ? 'ml-80' : ''}`}>
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
              <h4 className="text-lg font-medium mb-3">
                {editingCompId ? "Modifier la compétition" : "Créer une compétition"}
              </h4>
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
                  <select
                    value={compSport}
                    onChange={(e) => setCompSport(e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  >
                    <option value="">-- Choisir un sport --</option>
                    {sportList.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Pays organisateur</label>
                  <select
                    value={compCountry}
                    onChange={(e) => setCompCountry(e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                  >
                    <option value="">-- Choisir un pays --</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.nom}>{c.nom}</option>
                    ))}
                  </select>
                </div>

                {compErrors.length > 0 && <div className="text-red-600">{compErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {compSuccess && <div className="text-green-600">{compSuccess}</div>}

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editingCompId ? "Mettre à jour" : "Créer"}
                  </button>
                  {editingCompId && (
                    <button
                      type="button"
                      onClick={() => { setEditingCompId(null); setCompName(""); setCompStart(""); setCompEnd(""); setCompCountry(""); setCompSport(""); setCompSuccess(""); setCompErrors([]); }}
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8 border-t pt-4">
                <h5 className="font-semibold mb-4 text-gray-700">Liste des compétitions</h5>
                <div className="space-y-3">
                  {competitions.length === 0 && <p className="text-gray-500 italic">Aucune compétition trouvée.</p>}
                  {competitions.map((c) => {
                    const days = calculateDaysUntil(c.dateDebut);
                    return (
                      <div key={c.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-lg">{c.nom}</div>
                          <div className="text-sm text-gray-600">
                            {c.paysOrganisateur} • {c.type}
                          </div>
                          <div className={`text-sm mt-1 font-medium ${days <= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            {days > 0 ? `Démarre dans ${days} jour(s)` : "En cours ou terminée"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCompetition(c)}
                            className="text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deleteCompetition(c.id)}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "epreuve" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">
                {editingEpId ? "Modifier l'épreuve" : "Créer une épreuve"}
              </h4>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm">Discipline</label>
                    <select
                      value={epDiscipline}
                      onChange={(e) => setEpDiscipline(e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Choisir une discipline --</option>
                      {disciplineList.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Genre</label>
                    <select
                      value={epGenre}
                      onChange={(e) => setEpGenre(e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Choisir un genre --</option>
                      {genreList.map((g, i) => (
                        <option key={i} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
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
                    <label className="block text-sm">Lieu de l'épreuve</label>
                    <select
                      value={epLieuId}
                      onChange={(e) => setEpLieuId(e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Choisir un lieu --</option>
                      {lieuList.map((l) => (
                        <option key={l.id} value={l.id}>{l.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {epErrors.length > 0 && <div className="text-red-600">{epErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {epSuccess && <div className="text-green-600">{epSuccess}</div>}

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editingEpId ? "Mettre à jour" : "Créer"}
                  </button>
                  {editingEpId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEpId(null);
                        setEpName(""); setEpCompetition(""); setEpDate(""); setEpStartTime(""); setEpEndTime(""); setEpDiscipline(""); setEpGenre(""); setEpLieuId("");
                        setEpSuccess(""); setEpErrors([]);
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8 border-t pt-4">
                <h5 className="font-semibold mb-4 text-gray-700">Liste des épreuves</h5>
                <div className="space-y-3">
                  {epreuvesList.length === 0 && <p className="text-gray-500 italic">Aucune épreuve trouvée.</p>}
                  {epreuvesList.map((ep) => {
                    const days = calculateDaysUntil(ep.dateDebut);
                    const lieuName = ep.lieu ? ep.lieu.nom : "Non spécifié";
                    return (
                      <div key={ep.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          {ep.parent && (
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                              {ep.parent.nom}
                            </div>
                          )}
                          <div className="font-bold text-lg text-gray-800">{ep.nom}</div>
                          <div className="text-sm text-gray-600">
                            {ep.discipline} • {ep.genre} • {lieuName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Statut: {ep.status}
                          </div>
                          <div className={`text-sm mt-1 font-medium ${days <= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            {days > 0 ? `Démarre dans ${days} jour(s)` : "En cours ou terminée"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEpreuve(ep)}
                            className="text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => addParticipants(ep)}
                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Participants
                          </button>
                          <button
                            onClick={() => deleteEpreuve(ep.id)}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
      </div >
    </div >
  );
}
