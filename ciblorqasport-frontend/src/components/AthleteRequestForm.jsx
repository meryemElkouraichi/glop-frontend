import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function AthleteRequestForm({ onSuccess, allRequests = [] }) {
  const { user } = useAuth();
  const [nation, setNation] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(""); // Nouveau: Nom groupé (discipline + catégorie)
  const [sportId, setSportId] = useState("");
  const [genre, setGenre] = useState(""); // masculin / feminin
  const [handicap, setHandicap] = useState(false);
  const [certificat, setCertificat] = useState(null); // fichier
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Récupérer les sports depuis le backend
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await apiFetch("/sports");
        setSports(res.data);
      } catch (err) {
        console.error("Impossible de charger les sports", err);
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    const fetchPays = async () => {
      try {
        const res = await apiFetch("/pays");
        setCountries(res.data);
      } catch (err) {
        console.error("Impossible de charger les pays", err);
      }
    };
    fetchPays();
  }, []);

  // Gestion du groupement des sports par discipline + catégorie
  const availableSports = sports.filter((s) => {
    const alreadyRequested = allRequests.some(
      (req) => req.sport?.id === s.id && req.status !== "refusee"
    );
    return !alreadyRequested;
  });

  const groupedDisciplines = Array.from(
    new Set(sports.map((s) => `${s.discipline} (${s.categorie})`))
  ).sort((a, b) => a.localeCompare(b));

  // Normalisation des genres pour le matching (Hommes -> masculin, etc.)
  const normalizeGenre = (g) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (lower.startsWith("hom") || lower.startsWith("masc")) return "masculin";
    if (lower.startsWith("fem")) return "feminin";
    if (lower.startsWith("mix")) return "mixte";
    return lower;
  };

  // TOUS les genres disponibles pour la discipline sélectionnée (non filtrés par requests)
  const availableGenresForDiscipline = sports
    .filter((s) => `${s.discipline} (${s.categorie})` === selectedDiscipline)
    .map((s) => s.genre);

  const normalizedAvailableGenres = availableGenresForDiscipline.map(normalizeGenre);

  // Mise à jour de l'ID du sport quand la discipline et le genre sont choisis
  useEffect(() => {
    if (selectedDiscipline && genre) {
      const match = sports.find(
        (s) =>
          `${s.discipline} (${s.categorie})` === selectedDiscipline &&
          normalizeGenre(s.genre) === genre
      );

      if (match) {
        // Vérifier si déjà demandé
        const alreadyRequested = allRequests.some(
          (req) => req.sport?.id === match.id && req.status !== "refusee"
        );
        if (alreadyRequested) {
          setSportId("");
          setError("Vous avez déjà une demande en cours ou acceptée pour cette discipline et ce genre.");
        } else {
          setSportId(match.id);
          setError("");
        }
      } else {
        setSportId("");
      }
    } else {
      setSportId("");
      setError("");
    }
  }, [selectedDiscipline, genre, sports, allRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sportId) {
      setError("Cette discipline n'est pas disponible pour le genre sélectionné.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("sportId", sportId);
      formData.append("nationId", nation);
      formData.append("genre", genre);
      formData.append("handicap", handicap ? "true" : "false");
      if (certificat) formData.append("certificat", certificat);

      await apiFetch(`/athlete-requests/requeteAthlete?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        data: formData,
        isFormData: true,
        credentials: "include",
      });

      setSuccess("Votre demande a été envoyée avec succès.");
      setNation("");
      setSelectedDiscipline("");
      setSportId("");
      setGenre("");
      setHandicap(false);
      setCertificat(null);
      onSuccess?.();
    } catch {
      setError("Impossible d’envoyer la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium">Nation</label>
        <select
          className="w-full border rounded p-2"
          value={nation}
          onChange={(e) => setNation(e.target.value)}
          required
          disabled={loading || countries.length === 0}
        >
          <option value="">-- Choisissez un pays --</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Discipline</label>
        <select
          className="w-full border rounded p-2"
          value={selectedDiscipline}
          onChange={(e) => {
            setSelectedDiscipline(e.target.value);
            setGenre(""); // Reset genre when discipline changes
          }}
          required
          disabled={loading || groupedDisciplines.length === 0}
        >
          <option value="">-- Choisissez une discipline --</option>
          {groupedDisciplines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Genre</label>
        <select
          className="w-full border rounded p-2"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
          disabled={loading || !selectedDiscipline}
        >
          <option value="">-- Choisissez votre genre --</option>
          {normalizedAvailableGenres.includes("masculin") && (
            <option value="masculin">Homme</option>
          )}
          {normalizedAvailableGenres.includes("feminin") && (
            <option value="feminin">Femme</option>
          )}
          {normalizedAvailableGenres.includes("mixte") && (
            <option value="mixte">Mixte</option>
          )}

          {/* Fallback auto pour tout autre label inconnu */}
          {availableGenresForDiscipline.filter(g => !["masculin", "feminin", "mixte"].includes(normalizeGenre(g))).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={handicap}
            onChange={(e) => setHandicap(e.target.checked)}
            disabled={loading}
          />
          <span>Handicap</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Certificat médical (optionnel)</label>
        <input
          type="file"
          onChange={(e) => setCertificat(e.target.files[0])}
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-600 font-medium text-sm">{error}</p>}
      {success && <p className="text-green-600 font-medium text-sm">{success}</p>}

      <button
        type="submit"
        disabled={loading || (selectedDiscipline && !sportId)}
        className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold w-full hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md"
      >
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
