import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { ROLES } from "../constants/roles";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    telephone: "",
    role: "", // valeur vide pour forcer choix
    consentement: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Vérifications simples
    if (!form.role) {
      setError("Vous devez sélectionner un rôle.");
      return;
    }

    if (!form.consentement) {
      setError("Vous devez accepter les conditions.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        data: form,
      });

      setSuccess("Compte créé avec succès !");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError("Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow rounded">
      <h1 className="text-xl font-bold mb-4">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />

        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          required
          value={form.prenom}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />

        <input
          type="text"
          name="nom"
          placeholder="Nom"
          required
          value={form.nom}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />

        <input
          type="tel"
          name="telephone"
          placeholder="Téléphone"
          required
          value={form.telephone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        >
          <option value="" disabled>
            Choisissez un rôle
          </option>
          <option value={ROLES.SPECTATEUR}>{ROLES.SPECTATEUR}</option>
          <option value={ROLES.ATHLETE}>{ROLES.ATHLETE}</option>
          <option value={ROLES.COMMISSAIRE}>{ROLES.COMMISSAIRE}</option>
          <option value={ROLES.VOLONTAIRE}>{ROLES.VOLONTAIRE}</option>
          <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
        </select>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            name="consentement"
            checked={form.consentement}
            onChange={handleChange}
            disabled={loading}
          />
          <span>J’accepte les conditions d’utilisation</span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Création en cours..." : "S’inscrire"}
        </button>
      </form>
    </div>
  );
}
