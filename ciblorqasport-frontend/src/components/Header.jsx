import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  // 🔒 Header invisible tant que non connecté
  if (!user) return null;

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow mb-4">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">
          CiblOrgaSport
        </Link>

        <nav className="space-x-3 text-sm">
          <Link to="/events">Événements</Link>
          <Link to="/map">Carte</Link>
          <Link to="/security">Sécurité</Link>

          {user.roles.includes("spectator") && (
            <Link to="/tickets">Mes billets</Link>
          )}
          {user.roles.includes("athlete") && (
            <Link to="/athlete">Espace athlète</Link>
          )}
          {user.roles.includes("commissaire") && (
            <Link to="/commissaire">Commissaire</Link>
          )}
          {user.roles.includes("volunteer") && (
            <Link to="/volunteer">Volontaire</Link>
          )}
          {user.roles.includes("admin") && (
            <Link to="/admin">Admin</Link>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-3 text-sm">
        <span>
          Connecté : <strong>{user.email}</strong>
        </span>

        <Link to="/profile" className="underline">
          Profil
        </Link>

        <button
          onClick={logout}
          className="border px-2 py-1 rounded"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
