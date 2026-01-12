import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      const role = user.roles[0];

      switch (role) {
        case ROLES.SPECTATEUR:
          navigate("/spectateur", { replace: true });
          break;
        case ROLES.ATHLETE:
          navigate("/athlete", { replace: true });
          break;
        case ROLES.COMMISSAIRE:
          navigate("/commissaire", { replace: true });
          break;
        case ROLES.VOLONTAIRE:
          navigate("/volontaire", { replace: true });
          break;
        case ROLES.ADMIN:
          navigate("/administrateur", { replace: true });
          break;
        default:
          navigate("/home", { replace: true });
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold text-center mb-6">
        Connexion CiblOrgaSport
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded mt-2 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <button
          type="button"
          className="w-full bg-gray-200 text-black py-2 rounded mt-2"
          onClick={() => navigate("/register")}
          disabled={loading}
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}
