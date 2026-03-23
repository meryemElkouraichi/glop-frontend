import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";
import AthleteRequestSection from "../../components/AthleteRequestSection";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const [trackingActive, setTrackingActive] = useState(false);

  useEffect(() => {
    if (!user || !navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await apiFetch("/tracking/update", {
              method: "POST",
              data: {
                athleteId: user.id || user.user_id, // depends on how id is named in normalized user
                nom: `${user.prenom} ${user.nom}`,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            });
            setTrackingActive(true);
            console.log("Location updated:", position.coords.latitude, position.coords.longitude);
          } catch (err) {
            console.error("Failed to update location", err);
            setTrackingActive(false);
          }
        },
        (err) => {
          console.error("Geolocation error", err);
          setTrackingActive(false);
        }
      );
    };

    // Initial update
    sendLocation();

    // Periodic update every 30 seconds
    const interval = setInterval(sendLocation, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Espace Athlète</h2>
        {trackingActive && (
          <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Suivi GPS Actif (Conformité Charte)
          </div>
        )}
      </div>

      <div className="glass-card p-6 mb-8 rounded-xl shadow-sm border border-white/20">
        <p className="text-gray-700">
          Bonjour **{user?.prenom}**, vous êtes actuellement connecté.
          Conformément à la Charte Européenne du sport et aux règles anti-dopage,
          votre position est partagée avec les commissaires officiels pendant la compétition.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 font-outfit">Mes Demandes de Disciplines</h3>
        <p className="text-sm text-gray-600 mb-6">
          En tant qu'athlète, vous pouvez postuler pour participer à de nouvelles disciplines olympiques.
        </p>
        <AthleteRequestSection />
      </div>
    </div>
  );
}
