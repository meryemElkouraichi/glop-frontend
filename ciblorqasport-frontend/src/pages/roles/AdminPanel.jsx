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
  const [tab, setTab] = useState(localStorage.getItem("adminPanelTab") || "home");

  useEffect(() => {
    localStorage.setItem("adminPanelTab", tab);
  }, [tab]);


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
  const [epPhase, setEpPhase] = useState("UNIQUE");
  const [isEpEliminatoire, setIsEpEliminatoire] = useState(false);
  const [eligibleParticipants, setEligibleParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState(Array(8).fill(""));

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
  const [editingCerId, setEditingCerId] = useState(null);

  const submitCeremonie = (ev) => {
    ev.preventDefault();
    setCerErrors([]);
    setCerSuccess("");
    const e = [];
    if (!cerName.trim()) e.push("Le nom de la cérémonie est requis.");
    if (!cerCompetition) e.push("La compétition parente est requise.");
    if (!cerDate) e.push("La date est requise.");
    if (!cerStartTime) e.push("L'heure de début est requise.");
    if (!cerEndTime) e.push("L'heure de fin est requise.");
    if (!cerType) e.push("Le type de cérémonie est requis.");
    if (!cerLocation.trim()) e.push("Le lieu est requis.");
    if (e.length) { setCerErrors(e); return; }

    const payload = {
      typeObjet: "CEREMONIE",
      nom: cerName,
      dateDebut: cerDate,
      dateFin: cerDate,
      heureDebut: cerStartTime,
      heureFin: cerEndTime,
      lieuSpecifique: cerLocation,
      status: "Planifié",
      type: "Cérémonie",
      typeCeremonie: cerType.toUpperCase() // OUVERTURE, CLOTURE, REMISE_MEDAILLES
    };

    apiFetch(`/competitions/${cerCompetition}/children`, {
      method: "POST",
      data: payload
    })
      .then(() => {
        setCerSuccess("Cérémonie créée avec succès !");
        setCerName(""); setCerCompetition(""); setCerDate(""); setCerStartTime(""); setCerEndTime(""); setCerType(""); setCerLocation(""); setCerDescription("");
      })
      .catch((err) => {
        console.error(err);
        setCerErrors(["Erreur : " + (err.response?.data?.message || err.message)]);
      });
  };

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

  // List of ceremonies for display
  const [ceremoniesList, setCeremoniesList] = useState([]);


  // State for volunteer requests
  const [volunteerRequests, setVolunteerRequests] = useState([]);
  const [volLoading, setVolLoading] = useState(false);
  const [volError, setVolError] = useState("");
  const [volSuccess, setVolSuccess] = useState("");

  // State for planning import
  const [planningErrors, setPlanningErrors] = useState([]);
  const [planningSuccess, setPlanningSuccess] = useState("");

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
        setSportList([...r.data].sort((a, b) => a.localeCompare(b)));
      }
    });
  };

  const loadCountries = () => {
    apiFetch("/pays").then((r) => {
      if (r && Array.isArray(r.data)) {
        setCountries([...r.data].sort((a, b) => a.nom.localeCompare(b.nom)));
      }
    });
  };

  const loadDisciplines = () => {
    apiFetch("/sports/disciplines/distinct").then((r) => {
      if (r && Array.isArray(r.data)) {
        setDisciplineList([...r.data].sort((a, b) => a.localeCompare(b)));
      }
    });
  };

  const loadGenres = () => {
    apiFetch("/sports/genres/distinct").then((r) => {
      if (r && Array.isArray(r.data)) {
        setGenreList([...r.data].sort((a, b) => a.localeCompare(b)));
      }
    });
  };

  const loadLieux = () => {
    apiFetch("/lieux").then((r) => {
      if (r && Array.isArray(r.data)) {
        setLieuList([...r.data].sort((a, b) => a.nom.localeCompare(b.nom)));
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

  const loadCeremonies = () => {
    apiFetch("/events").then((r) => {
      if (r && Array.isArray(r.data)) {
        // Filtern on typeObjet discriminator
        const filtered = r.data.filter(ev => ev.typeObjet === "CEREMONIE");
        setCeremoniesList(filtered);
      }
    }).catch(err => {
      console.error("Error loading ceremonies:", err);
    });
  };

  const deleteCeremonie = async (id) => {
    if (!window.confirm("Supprimer cette cérémonie ?")) return;
    try {
      await apiFetch(`/events/${id}`, { method: "DELETE" });
      loadCeremonies();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la cérémonie.");
    }
  };

  const editCeremonie = (c) => {
    setEditingCerId(c.id);
    setCerName(c.nom || "");
    setCerCompetition(c.parent?.id || "");
    setCerDate(c.dateDebut || "");
    setCerStartTime(c.heureDebut || "");
    setCerEndTime(c.heureFin || "");
    setCerLocation(c.lieu?.id || "");
    const mapTypeBack = (t) => {
      if (!t) return "";
      if (t === "REMISE_MEDAILLES") return "remise_prix";
      return t.toLowerCase();
    };
    setCerType(mapTypeBack(c.typeCeremonie || ""));
    setTab("ceremonie");
  };

  const loadVolunteerRequests = () => {
    setVolLoading(true);
    apiFetch("/volontaire-requests/all").then((r) => {
      if (r && Array.isArray(r.data)) {
        setVolunteerRequests(r.data);
      }
    }).catch(err => {
      console.error("Error loading volunteer requests:", err);
      setVolError("Erreur lors du chargement des demandes.");
    }).finally(() => {
      setVolLoading(false);
    });
  };

  useEffect(() => {
    if (epDiscipline && epGenre) {
      // Check if sport is eliminatoire
      apiFetch(`/sports/is-eliminatoire?discipline=${encodeURIComponent(epDiscipline)}`)
        .then(r => setIsEpEliminatoire(r.data))
        .catch(() => setIsEpEliminatoire(false));

      // Fetch eligible participants
      // Determine if team or individual (can check epDiscipline if wanted, or just try both)
      // Actually, my new endpoints handle this. 
      // I'll check the sport category first or just fetch teams if it's "equipe" in the name or from a sport object.
      // For now, let's try to fetch both and the backend logic already knows? 
      // No, I have two endpoints.
      const isTeamSport = epDiscipline.toLowerCase().includes("water polo") || epDiscipline.toLowerCase().includes("relais") || epDiscipline.toLowerCase().includes("artistique");
      const endpoint = isTeamSport ? "/sports/eligible-equipes" : "/sports/eligible-athletes";

      apiFetch(`${endpoint}?discipline=${encodeURIComponent(epDiscipline)}&genre=${encodeURIComponent(epGenre)}`)
        .then(r => setEligibleParticipants(r.data || []))
        .catch(() => setEligibleParticipants([]));
    } else {
      setIsEpEliminatoire(false);
      setEligibleParticipants([]);
    }
  }, [epDiscipline, epGenre]);

  useEffect(() => {
    loadIncidents();
    loadCompetitions();
    loadSports();
    loadCountries();
    loadDisciplines();
    loadGenres();
    loadLieux();
    loadEpreuves();
    loadCeremonies();
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
    if (tab === "competition") loadCompetitions();
    if (tab === "epreuve") loadEpreuves();
    if (tab === "volontaire") loadVolunteerRequests();
    if (tab === "ceremonie") {
      loadLieux();
      loadCeremonies();
    }
    if (tab === "alerte") loadIncidents();
  }, [tab]);

  useEffect(() => {
    if (location && location.hash) {
      const h = location.hash.replace('#', '');
      if (h) setTab(h);
    }
  }, [location]);

  const fetchCompetitions = () => {
    loadCompetitions();
  };

  const validateCompetition = () => {
    const e = [];
    if (!compName.trim()) e.push("Le nom de la compétition est requis.");
    if (!compStart) e.push("La date de début est requise.");
    if (!compEnd) e.push("La date de fin est requise.");
    if (!compSport.trim()) e.push("Le sport associé est requis.");
    if (compStart && compEnd) {
      const start = new Date(compStart);
      const end = new Date(compEnd);
      if (start > end) e.push("La date de début doit être antérieure ou égale à la date de fin.");
    }
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
      type: compSport || "Général",
      dateDebut: compStart,
      dateFin: compEnd,
      heureDebut: compStartTime || "00:00:00",
      heureFin: compEndTime || "23:59:59",
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
      setCompName(""); setCompStart(""); setCompStartTime(""); setCompEnd(""); setCompEndTime(""); setCompCountry(""); setCompSport("");
      setEditingCompId(null);
      loadCompetitions();
      fetchCompetitions();
    } catch (error) {
      console.error(error);
      setCompErrors(["Erreur lors de l'enregistrement: " + (error.response?.data?.message || error.message)]);
    }
  };

  const validateEpreuve = () => {
    const e = [];
    if (!epName.trim()) e.push("Le nom de l'épreuve est requis.");
    if (!epCompetition.trim()) e.push("La compétition parente est requise.");
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

    if (isEpEliminatoire && epPhase === "QUART") {
      const validParticipants = selectedParticipants.filter(id => id !== "");
      if (validParticipants.length < 8) {
        e.push("Vous devez sélectionner exactement 8 participants pour les Quarts de finale.");
      }
      const uniqueParticipants = new Set(validParticipants);
      if (uniqueParticipants.size < validParticipants.length) {
        e.push("Un même participant ne peut pas être sélectionné plusieurs fois.");
      }
    }

    // Check if the epreuve date makes sense relative to today
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
      status: "Planifié",
      phase: epPhase,
      participantIds: isEpEliminatoire ? selectedParticipants.filter(id => id !== "") : []
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
      setEpPhase("UNIQUE"); setSelectedParticipants(Array(8).fill(""));
      setEditingEpId(null);
      loadEpreuves();
    } catch (error) {
      console.error("Erreur enregistrement épreuve:", error);
      const serverMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null);
      const msg = serverMsg || "Erreur lors de l'enregistrement de l'épreuve. Vérifiez les dates par rapport à la compétition.";
      setEpErrors([msg]);
    }
  };

  const calculateDaysUntil = (dateStr) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const editCompetition = (c) => {
    setEditingCompId(c.id || c.evenement_id);
    setCompName(c.nom || c.nomEvenement || "");
    setCompStart(c.dateDebut || "");
    setCompStartTime(c.heureDebut || "");
    setCompEnd(c.dateFin || "");
    setCompEndTime(c.heureFin || "");
    setCompCountry(c.paysOrganisateur || "");
    setCompSport(c.type || "");
    setTab("competition");
  };

  const deleteCompetition = async (id) => {
    if (!window.confirm("Supprimer cette compétition ?")) return;
    try {
      await apiFetch(`/competitions/${id}`, { method: "DELETE" });
      loadCompetitions();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const editEpreuve = (ep) => {
    setEditingEpId(ep.id);
    setEpName(ep.nom || "");
    setEpCompetition(ep.parent?.id || "");
    setEpDiscipline(ep.discipline || "");
    setEpGenre(ep.genre || "");
    setEpDate(ep.dateDebut || "");
    setEpStartTime(ep.heureDebut || "");
    setEpEndTime(ep.heureFin || "");
    setEpLieuId(ep.lieu?.id || "");
    setTab("epreuve");
  };

  const deleteEpreuve = async (id) => {
    if (!window.confirm("Supprimer cette épreuve ?")) return;
    try {
      await apiFetch(`/epreuves/${id}`, { method: "DELETE" });
      loadEpreuves();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
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
                className={`w-full text-left p-2 rounded ${tab === "volontaire" ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setTab("volontaire")}
              >
                Demandes Volontaires
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
                    const cid = c.id || c.evenement_id;
                    const cname = c.nom || c.nomEvenement || "Compétition sans nom";
                    return (
                      <div key={cid} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-lg">{cname}</div>
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
                            onClick={() => deleteCompetition(cid)}
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
                    onChange={(e) => {
                      setEpCompetition(e.target.value);
                      setEpLieuId(""); // Reset lieu on competition change
                    }}
                    className="mt-1 block w-full border rounded p-2"
                  >
                    <option value="">-- Choisir une compétition --</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.paysOrganisateur})
                      </option>
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
                      disabled={!epCompetition}
                    >
                      <option value="">-- Choisir un lieu --</option>
                      {lieuList
                        .filter(l => {
                          if (!epCompetition) return true;
                          const comp = competitions.find(c => (c.id === epCompetition || c.evenement_id === epCompetition));
                          if (!comp) return true; // Show all if competition not found in list (fallback)

                          const lPays = (l.pays || "").trim().toLowerCase();
                          const cPays = (comp.paysOrganisateur || "").trim().toLowerCase();

                          // Fallback: if no country defined on either, show it
                          if (!lPays || !cPays) return true;

                          return lPays === cPays;
                        })
                        .map((l) => (
                          <option key={l.id} value={l.id}>{l.nom} ({l.ville}, {l.pays})</option>
                        ))}
                    </select>
                    {!epCompetition && !epSuccess && <p className="text-[10px] text-orange-600 mt-1">Sélectionnez d'abord une compétition.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm">Phase du tournoi</label>
                    <select
                      value={epPhase}
                      onChange={(e) => setEpPhase(e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                      disabled={!isEpEliminatoire && epPhase === "UNIQUE"}
                    >
                      <option value="UNIQUE">Épreuve Unique / Finale</option>
                      {isEpEliminatoire && (
                        <>
                          <option value="QUART">Quarts de finale (1/4)</option>
                          <option value="DEMI">Demi-finales (1/2)</option>
                          <option value="FINALE">Finale</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {isEpEliminatoire && epPhase === "QUART" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                    <h5 className="text-sm font-semibold mb-3 text-blue-800">Sélection des 8 participants pour les Quarts</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedParticipants.map((pId, idx) => (
                        <div key={idx}>
                          <label className="block text-xs text-gray-600">Participant {idx + 1}</label>
                          <select
                            value={pId}
                            onChange={(e) => {
                              const newP = [...selectedParticipants];
                              newP[idx] = e.target.value;
                              setSelectedParticipants(newP);
                            }}
                            className="mt-1 block w-full border rounded p-1 text-sm bg-white"
                          >
                            <option value="">-- Choisir --</option>
                            {eligibleParticipants
                              .filter(p => !selectedParticipants.includes(p.id) || p.id === pId)
                              .map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.nom || (p.user ? `${p.user.prenom} ${p.user.nom}` : "Sans nom")} ({p.nation || p.pays || "N/A"})
                                </option>
                              ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-blue-600 mt-2 italic">Note: Le tirage au sort des matchs sera fait aléatoirement à la création.</p>
                  </div>
                )}

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
              </form >

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
            </div >
          )}

          {tab === "volontaire" && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="text-lg font-medium mb-3">Gestion des demandes de volontariat</h4>
              {volLoading ? (
                <p>Chargement...</p>
              ) : volError ? (
                <p className="text-red-600">{volError}</p>
              ) : volunteerRequests.length === 0 ? (
                <p className="text-gray-500 italic">Aucune demande en attente.</p>
              ) : (
                <div className="space-y-3">
                  {volunteerRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{req.userPrenom} {req.userNom}</div>
                        <div className="text-sm text-gray-600">
                          Email: {req.userEmail} • Téléphone: {req.userTelephone || "Non spécifié"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Événement: {req.evenement?.nom} ({req.evenement?.type})
                        </div>
                        <div className="text-sm text-gray-500">
                          Demandé le: {new Date(req.dateDemande).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm("Accepter cette demande de volontariat ?")) {
                              apiFetch(`/volontaire-requests/${req.id}/accept?adminId=${user.id}`, { method: "POST" })
                                .then(() => {
                                  setVolSuccess("Demande acceptée.");
                                  loadVolunteerRequests();
                                })
                                .catch(err => setVolError("Erreur lors de l'acceptation."));
                            }
                          }}
                          className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => {
                            const motif = prompt("Motif du refus (optionnel):");
                            apiFetch(`/volontaire-requests/${req.id}/refuse?adminId=${user.id}&motif=${encodeURIComponent(motif || "")}`, { method: "POST" })
                              .then(() => {
                                setVolSuccess("Demande refusée.");
                                loadVolunteerRequests();
                              })
                              .catch(err => setVolError("Erreur lors du refus."));
                          }}
                          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {volSuccess && <div className="text-green-600 mt-4">{volSuccess}</div>}
            </div>
          )}

          {/* Section Import Planning */}
          {tab === "volontaire" && (
            <div className="bg-white p-4 rounded shadow mt-6">
              <h4 className="text-lg font-medium mb-3">Importer Planning Volontaires (JSON)</h4>
              <form onSubmit={(ev) => {
                ev.preventDefault();
                setPlanningErrors([]);
                setPlanningSuccess("");
                const jsonText = document.getElementById('planningJson').value;
                if (!jsonText.trim()) {
                  setPlanningErrors(["Le JSON est requis."]);
                  return;
                }
                try {
                  const planningData = JSON.parse(jsonText);
                  if (!Array.isArray(planningData)) {
                    setPlanningErrors(["Le JSON doit être un tableau d'objets."]);
                    return;
                  }
                  apiFetch("/planning-volontaire/import", {
                    method: "POST",
                    data: planningData
                  }).then(() => {
                    setPlanningSuccess("Planning importé avec succès !");
                    document.getElementById('planningJson').value = "";
                  }).catch(err => {
                    const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Erreur inconnue";
                    setPlanningErrors(["Erreur lors de l'import: " + errorMsg]);
                  });
                } catch (e) {
                  setPlanningErrors(["JSON invalide: " + e.message]);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-sm">JSON des plannings</label>
                  <textarea
                    id="planningJson"
                    className="mt-1 block w-full border rounded p-2 h-64 font-mono text-sm"
                    placeholder='Exemple: [{"userEmail": "volontaire@example.com", "evenementId": "123e4567-e89b-12d3-a456-426614174000", "date": "2026-03-16", "heureDebut": "09:00", "heureFin": "12:00", "role": "Accueil"}]'
                  />
                </div>
                {planningErrors.length > 0 && <div className="text-red-600">{planningErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                {planningSuccess && <div className="text-green-600">{planningSuccess}</div>}
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Importer</button>
                </div>
              </form>
            </div>
          )}

          {
            tab === "ceremonie" && (
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
                    lieu: cerLocation ? { id: cerLocation } : null,
                    parent: cerCompetition ? { id: cerCompetition, typeObjet: "COMPETITION" } : null,
                    status: "Planifié",
                    typeCeremonie: mapCerType(cerType)
                  };

                  try {
                    if (editingCerId) {
                      await apiFetch(`/events/${editingCerId}`, {
                        method: "PUT",
                        data: ceremonieData
                      });
                      setCerSuccess("Cérémonie mise à jour !");
                    } else {
                      const url = cerCompetition
                        ? `/competitions/${cerCompetition}/children`
                        : "/events"; // Fallback to generic events if no competition

                      await apiFetch(url, {
                        method: "POST",
                        data: ceremonieData
                      });
                      setCerSuccess("Cérémonie créée avec succès !");
                    }
                    setCerName(""); setCerDate(""); setCerStartTime(""); setCerEndTime(""); setCerType(""); setCerLocation(""); setCerCompetition("");
                    setEditingCerId(null);
                    loadCeremonies();
                  } catch (error) {
                    console.error("Erreur création/modification cérémonie:", error);
                    const status = error.response ? error.response.status : "Inconnu";
                    const errorMsg = error.response?.data?.message || error.response?.data || "Erreur serveur.";
                    alert(`Erreur technique (${status})\nMessage: ${errorMsg}`);
                    setCerErrors(["Erreur lors de l'enregistrement de la cérémonie sur le serveur."]);
                  }
                }} className="space-y-3">
                  <div>
                    <label className="block text-sm">Compétition Parente</label>
                    <select
                      value={cerCompetition}
                      onChange={(e) => {
                        setCerCompetition(e.target.value);
                        setCerLocation(""); // Reset location on change
                      }}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Choisir une compétition --</option>
                      {competitions.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({c.paysOrganisateur})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Nom de la cérémonie</label>
                    <input value={cerName} onChange={(e) => setCerName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
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
                      <select
                        value={cerLocation}
                        onChange={(e) => setCerLocation(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        disabled={!cerCompetition}
                      >
                        <option value="">-- Choisir un lieu --</option>
                        {lieuList
                          .filter(l => {
                            if (!cerCompetition) return true;
                            const comp = competitions.find(c => (c.id === cerCompetition || c.evenement_id === cerCompetition));
                            if (!comp) return true;

                            const lPays = (l.pays || "").trim().toLowerCase();
                            const cPays = (comp.paysOrganisateur || "").trim().toLowerCase();

                            if (!lPays || !cPays) return true;
                            return lPays === cPays;
                          })
                          .map((l) => (
                            <option key={l.id} value={l.id}>{l.nom} ({l.ville}, {l.pays})</option>
                          ))}
                      </select>
                      {!cerCompetition && !cerSuccess && <p className="text-[10px] text-orange-600 mt-1">Sélectionnez d'abord une compétition.</p>}
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
                  {/* Lieu input et Description retirés à la demande de l'utilisateur */}

                  {cerErrors.length > 0 && <div className="text-red-600">{cerErrors.map((err, i) => <div key={i}>{err}</div>)}</div>}
                  {cerSuccess && <div className="text-green-600">{cerSuccess}</div>}

                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                      {editingCerId ? "Mettre à jour" : "Créer"}
                    </button>
                    {editingCerId && (
                      <button
                        type="button"
                        onClick={() => { setEditingCerId(null); setCerName(""); setCerDate(""); setCerStartTime(""); setCerEndTime(""); setCerType(""); setCerLocation(""); setCerCompetition(""); setCerSuccess(""); setCerErrors([]); }}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>

                <div className="mt-8 border-t pt-4">
                  <h5 className="font-semibold mb-4 text-gray-700">Liste des cérémonies</h5>
                  <div className="space-y-3">
                    {ceremoniesList.length === 0 && <p className="text-gray-500 italic">Aucune cérémonie trouvée.</p>}
                    {ceremoniesList.map((c) => {
                      const cid = c.id;
                      const cname = c.nom || "Cérémonie sans nom";
                      return (
                        <div key={cid} className="p-4 border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-bold text-lg">{cname}</div>
                            <div className="text-sm text-gray-600">
                              {/* TypeCeremonie (OUVERTURE/CLOTURE...) retiré à la demande de l'utilisateur */}
                              {c.dateDebut}
                            </div>
                            <div className="text-sm text-gray-500">
                              {c.lieu?.nom || "Lieu non spécifié"} • {c.heureDebut} - {c.heureFin}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editCeremonie(c)}
                              className="text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded text-sm transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteCeremonie(cid)}
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
            )
          }
          {
            tab === "analytics" && (
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
            )
          }
          {
            tab === 'alerte' && (
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
            )
          }
        </section >

      </div >
    </div >
  );
}

