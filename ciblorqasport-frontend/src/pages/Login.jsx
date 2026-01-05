// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // <-- ajoute Link
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      const role = user.roles[0];

      switch (role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "ATHLETE":
          navigate("/athlete");
          break;
        case "COMMISSAIRE":
          navigate("/commissaire");
          break;
        case "VOLUNTEER":
          navigate("/volunteer");
          break;
        default:
          navigate("/spectator");
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold text-center mb-6">Connexion CiblOrgaSport</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Message d'erreur */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {/* Bouton de connexion */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>

      {/* Lien vers inscription */}
      <p className="text-center text-sm mt-4">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-blue-600 underline">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
}
