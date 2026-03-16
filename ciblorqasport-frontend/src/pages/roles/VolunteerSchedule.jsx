import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import VolunteerRequestSection from "../../components/VolunteerRequestSection";

export default function VolunteerSchedule() {
  const { user } = useAuth();
  const [planning, setPlanning] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanning = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/planning-volontaire/me?email=${encodeURIComponent(user.email)}`);
        setPlanning(res.data || []);
      } catch (err) {
        console.error("Error fetching planning:", err);
        setPlanning([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanning();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Espace Volontaire</h2>
      <p className="mb-4">Gérez vos demandes de volontariat et consultez votre planning.</p>

      <VolunteerRequestSection />

      <div className="border-t pt-4 mt-6">
        <h3 className="text-xl font-semibold mb-2">Mon Planning</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : planning.length === 0 ? (
          <p>Aucun planning assigné pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {planning.map((p) => (
              <li key={p.id} className="border p-3 rounded">
                <p><strong>Événement:</strong> {p.evenement?.nom} ({p.evenement?.type})</p>
                <p><strong>Date:</strong> {p.date}</p>
                <p><strong>Heures:</strong> {p.heureDebut} - {p.heureFin}</p>
                <p><strong>Rôle:</strong> {p.role}</p>
                <p><strong>Description:</strong> {p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
