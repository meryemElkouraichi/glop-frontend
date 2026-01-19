import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function AthleteRequestForm({ onSuccess }) {
  const { user } = useAuth();
  const [nation, setNation] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("sportId", sportId);
      formData.append("nation", nation);
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
        <input
          type="text"
          className="w-full border rounded p-2"
          value={nation}
          onChange={(e) => setNation(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Sport</label>
        <select
          className="w-full border rounded p-2"
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          required
          disabled={loading || sports.length === 0}
        >
          <option value="">-- Choisissez un sport --</option>
          {sports.map((s) => (
            <option key={s.id || s.sport_id} value={s.id || s.sport_id}>
              {s.nom} ({s.typeSport}, {s.categorie})
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
