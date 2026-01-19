import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AthleteRequestForm from "../../components/AthleteRequestForm";
import { apiFetch } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext"; // pour récupérer l'email

export default function SpectatorDashboard() {
  const { user } = useAuth(); // récupère l'utilisateur connecté
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie si l'utilisateur a déjà fait une demande
  const fetchDemande = async () => {
    if (!user?.email) {
      setDemande(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(
        `/athlete-requests/me?email=${encodeURIComponent(user.email)}`
      );
      setDemande(res.data);
    } catch {
      setDemande(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Espace Spectateur</h2>
      <p className="mb-4">
        Bienvenue sur votre espace personnel. Ici, vous pouvez :
      </p>

      <ul className="list-disc list-inside space-y-1 mb-6">
        <li>
          Consulter les <Link to="/events" className="text-blue-600">compétitions</Link> disponibles
        </li>
        <li>
          Accéder à vos <Link to="/tickets" className="text-blue-600">billets numériques</Link>
        </li>
        <li>
          Suivre les <Link to="/notifications" className="text-blue-600">résultats en direct</Link>
        </li>
        <li>
          Être alerté des <Link to="/security" className="text-blue-600">alertes de sécurité</Link>
        </li>
        <li>
          Découvrir les <Link to="/map" className="text-blue-600">fan zones</Link> et itinéraires
        </li>
      </ul>

      {/* Section demande athlète */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-xl font-semibold mb-2">Demande pour devenir Athlète</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : demande?.status && demande.status !== "NONE" ? (
          <p>
            Votre demande est actuellement : <strong>{demande.status}</strong>
          </p>
        ) : (
          <AthleteRequestForm onSuccess={fetchDemande} />
        )}
      </div>
    </div>
  );
}
