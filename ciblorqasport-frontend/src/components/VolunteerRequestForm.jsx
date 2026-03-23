import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function VolunteerRequestForm({ onSuccess }) {
  const { user } = useAuth();
  const [evenementId, setEvenementId] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Récupérer les événements depuis le backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiFetch("/events");
        // Filtrer pour ne garder que les épreuves (pas les compétitions)
        const epreuvesOnly = (res.data || []).filter(event => event.typeObjet === "EPREUVE");
        setEvents(epreuvesOnly);
      } catch (err) {
        console.error("Impossible de charger les événements", err);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiFetch(`/volontaire-requests/requeteVolontaire?email=${encodeURIComponent(user.email)}&evenementId=${encodeURIComponent(evenementId)}`, {
        method: "POST",
        credentials: "include",
      });

      setSuccess("Votre demande de volontariat a été envoyée avec succès.");
      setEvenementId("");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Impossible d’envoyer la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium">Événement</label>
        <select
          className="w-full border rounded p-2"
          value={evenementId}
          onChange={(e) => setEvenementId(e.target.value)}
          required
          disabled={loading || events.length === 0}
        >
          <option value="">-- Choisissez un événement --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.nom} ({event.typeObjet})
            </option>
          ))}
        </select>
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
