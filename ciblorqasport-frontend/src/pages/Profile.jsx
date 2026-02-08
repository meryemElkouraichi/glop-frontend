import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";

export default function Profile() {
  const { user } = useAuth();
  const [pays, setPays] = useState([]);
  const [selectedPays, setSelectedPays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPays = async () => {
      try {
        const res = await apiFetch("/pays/all", {
          credentials: "include",
        });
        setPays(res.data || []);
      } catch (e) {
        console.error("Erreur lors du chargement des pays:", e);
      }
    };

    const fetchUserInfo = async () => {
      if (user?.id) {
        try {
          const res = await apiFetch(`/users/${user.id}`, {
            credentials: "include",
          });
          setSelectedPays(res.data.paysId);
        } catch (e) {
          console.error("Erreur lors du chargement des infos utilisateur:", e);
        }
      }
    };

    fetchPays();
    fetchUserInfo();
  }, [user?.id]);

  const handleUpdateCountry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiFetch(`/users/${user.id}/pays`, {
        method: "PUT",
        body: JSON.stringify({ paysId: selectedPays || null }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Erreur lors de la mise à jour:", e);
      setError("Erreur lors de la mise à jour du pays");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-6">Aucun utilisateur connecté</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Mon profil</h2>

      <div className="space-y-4 mb-8">
        <p><strong>Identifiant :</strong> {user.email}</p>
        <p><strong>Prénom :</strong> {user.prenom}</p>
        <p><strong>Nom :</strong> {user.nom}</p>
        <p><strong>Rôles :</strong> {user.roles.join(", ")}</p>
      </div>

      {/* Section pour commissaire - Sélection du pays */}
      {user.roles && user.roles.includes("Commissaire") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Gestion de votre pays</h3>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              Pays mis à jour avec succès!
            </div>
          )}

          <form onSubmit={handleUpdateCountry}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Sélectionner votre pays
              </label>
              <select
                value={selectedPays || ""}
                onChange={(e) => setSelectedPays(e.target.value || null)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">-- Aucun pays sélectionné --</option>
                {pays.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4">
            Vous ne verrez que les demandes d'athlète concernant le pays que vous avez sélectionné.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Vos informations personnelles sont traitées conformément au RGPD.
        Vous pouvez à tout moment consulter et gérer vos préférences de confidentialité.
      </p>
    </div>
  );
}
