import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function AthleteRequestForm({ onSuccess, allRequests = [] }) {
  const { user } = useAuth();
  const [nation, setNation] = useState("");
  const [countries, setCountries] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          required
          disabled={loading || sports.length === 0}
        >
          <option value="">-- Choisissez une discipline --</option>
          {sports
            .filter((s) => {
              // On garde le sport seulement si l'utilisateur n'a pas déjà une demande
              // en cours ou acceptée pour cette discipline précise.
              const alreadyRequested = allRequests.some(
                (req) => req.sport?.id === s.id && req.status !== "refusee"
              );
              return !alreadyRequested;
            })
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.discipline} ({s.categorie}, {s.genre})
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
          disabled={loading}
        >
          <option value="">-- Choisissez votre genre --</option>
          <option value="masculin">Masculin</option>
          <option value="feminin">Féminin</option>
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

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
