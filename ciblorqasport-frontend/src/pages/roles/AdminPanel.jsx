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
  const [alertErrors, setAlertErrors] = useState([]);
  const [alertSuccess, setAlertSuccess] = useState("");

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
    if (!compStartTime) e.push("L'heure de début est requise.");
    if (!compEnd) e.push("La date de fin est requise.");
    if (!compEndTime) e.push("L'heure de fin est requise.");
    if (compStart && compStartTime && compEnd && compEndTime) {
      const start = new Date(compStart + "T" + compStartTime);
      const end = new Date(compEnd + "T" + compEndTime);
      if (start > end) e.push("La date/heure de début doit être antérieure ou égale à la date/heure de fin.");
    }
    if (!compSport.trim()) e.push("Le sport associé est requis.");
    if (!compCountry.trim()) e.push("Le pays organisateur est requis.");
    return e;
  };

  const submitCompetition = (ev) => {
    ev.preventDefault();
    setCompErrors([]);
    setCompSuccess("");
    const e = validateCompetition();
    if (e.length) {
      setCompErrors(e);
      return;
    }
    const competition = { name: compName, sport: compSport, startDate: compStart, startTime: compStartTime, endDate: compEnd, endTime: compEndTime, country: compCountry };
    console.log("[Admin] Création compétition (front-only):", competition);
    setCompSuccess("Compétition créée (front-only)");
    setCompName("");
    setCompStart("");
    setCompStartTime("");
    setCompEnd("");
    setCompEndTime("");
    setCompCountry("");
    setCompSport("");
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

  const submitEpreuve = (ev) => {
    ev.preventDefault();
    setEpErrors([]);
    setEpSuccess("");
    const e = validateEpreuve();
    if (e.length) {
      setEpErrors(e);
      return;
    }
    const epreuve = { name: epName, competition: epCompetition, sport: epSport, date: epDate, startTime: epStartTime, endTime: epEndTime, location: epLocation };
    console.log("[Admin] Création épreuve (front-only):", epreuve);
    setEpSuccess("Épreuve créée (front-only)");
    setEpName("");
    setEpCompetition("");
    setEpDate("");
    setEpStartTime("");
    setEpEndTime("");
    setEpSport("");
    setEpLocation("");
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
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm">Date de début</label>
                    <input type="date" value={compStart} onChange={(e) => setCompStart(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure de début</label>
                    <input type="time" value={compStartTime} onChange={(e) => setCompStartTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Date de fin</label>
                    <input type="date" value={compEnd} onChange={(e) => setCompEnd(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm">Heure de fin</label>
                    <input type="time" value={compEndTime} onChange={(e) => setCompEndTime(e.target.value)} className="mt-1 block w-full border rounded p-2" />
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
                  <label className="block text-sm">Compétition (nom)</label>
                  <input value={epCompetition} onChange={(e) => setEpCompetition(e.target.value)} className="mt-1 block w-full border rounded p-2" />
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
              <form onSubmit={(ev) => {
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
                const ceremonie = { name: cerName, date: cerDate, startTime: cerStartTime, endTime: cerEndTime, type: cerType, location: cerLocation, description: cerDescription };
                console.log("[Admin] Création cérémonie (front-only):", ceremonie);
                setCerSuccess("Cérémonie créée (front-only)");
                setCerName(""); setCerDate(""); setCerStartTime(""); setCerEndTime(""); setCerType(""); setCerLocation(""); setCerDescription("");
              }} className="space-y-3">
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
                const alert = { title: alertTitle, description: alertDescription, level: alertLevel };
                console.log("[Admin] Création alerte sécurité (front-only):", alert);
                setAlertSuccess("Alerte créée (front-only)");
                setAlertTitle(""); setAlertDescription(""); setAlertLevel("");
              }} className="space-y-3">
                <div>
                  <label className="block text-sm">Titre</label>
                  <input value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm">Niveau</label>
                  <select value={alertLevel} onChange={(e) => setAlertLevel(e.target.value)} className="mt-1 block w-full border rounded p-2">
                    <option value="">-- Choisir --</option>
                    <option value="info">Info</option>
                    <option value="alerte">Alerte</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <textarea value={alertDescription} onChange={(e) => setAlertDescription(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={4} />
                </div>
                {alertErrors.length > 0 && <div className="text-red-600">{alertErrors.map((err,i)=><div key={i}>{err}</div>)}</div>}
                {alertSuccess && <div className="text-green-600">{alertSuccess}</div>}
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Créer</button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
